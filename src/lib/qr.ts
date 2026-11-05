import crypto from "crypto";
import QRCode from "qrcode";
import { MealType, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";
import { formatIST, getTodayServiceDate } from "./timezone";

export interface GenerateQrResult {
  token: string;
  dataUrl: string;
  expiresAt: Date;
  serviceDate: string;
  mealType: MealType;
  staffName: string;
  staffId: string;
}

export type QrVerificationStatus =
  | "SUCCESS"
  | "ALREADY_COLLECTED"
  | "INELIGIBLE"
  | "DATE_MISMATCH"
  | "INVALID_TOKEN"
  | "EXPIRED"
  | "STAFF_INACTIVE"
  | "ERROR";

export interface QrVerificationResult {
  status: QrVerificationStatus;
  success: boolean;
  message: string;
  data?: {
    staffId: string;
    staffName: string;
    department?: string | null;
    mealType: MealType;
    serviceDate: string;
    collectedAt?: Date;
    previouslyCollectedAt?: Date;
  };
}

/**
 * Generates or retrieves an existing valid QR token for an eligible meal request.
 */
export async function getOrCreateMealQr(
  userId: string,
  serviceDate: string,
  mealType: MealType
): Promise<GenerateQrResult | null> {
  // Verify that the user has an OPT_IN response for this meal
  const response = await prisma.mealResponse.findUnique({
    where: {
      userId_serviceDate_mealType: {
        userId,
        serviceDate,
        mealType,
      },
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!response || response.status !== "OPT_IN" || !response.user.isActive) {
    return null;
  }

  // Check if active QR token already exists
  let qrRecord = await prisma.qrToken.findUnique({
    where: {
      userId_serviceDate_mealType: {
        userId,
        serviceDate,
        mealType,
      },
    },
  });

  const now = new Date();
  if (!qrRecord || qrRecord.isRevoked || qrRecord.expiresAt < now) {
    // Generate unpredictable secure token
    const token = `DBI-${serviceDate}-${mealType}-${crypto.randomBytes(16).toString("hex")}`;
    // Token expires 48 hours after service date
    const expiresAt = new Date(`${serviceDate}T23:59:59+05:30`);
    expiresAt.setDate(expiresAt.getDate() + 2);

    qrRecord = await prisma.qrToken.upsert({
      where: {
        userId_serviceDate_mealType: {
          userId,
          serviceDate,
          mealType,
        },
      },
      update: {
        token,
        expiresAt,
        isRevoked: false,
      },
      create: {
        userId,
        serviceDate,
        mealType,
        token,
        expiresAt,
      },
    });
  }

  // Generate QR image data URL
  const dataUrl = await QRCode.toDataURL(qrRecord.token, {
    width: 320,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  return {
    token: qrRecord.token,
    dataUrl,
    expiresAt: qrRecord.expiresAt,
    serviceDate,
    mealType,
    staffName: response.user.profile?.fullName || response.user.staffId,
    staffId: response.user.staffId,
  };
}

/**
 * Server-side atomic verification and collection recording for canteen operator.
 * Uses an interactive database transaction to ensure duplicate collection cannot occur,
 * even with concurrent scans.
 */
export async function verifyAndCollectMeal(
  token: string,
  canteenUserId: string,
  expectedServiceDate?: string
): Promise<QrVerificationResult> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return {
      status: "INVALID_TOKEN",
      success: false,
      message: "No token provided.",
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Locate the QR token
      const qrRecord = await tx.qrToken.findUnique({
        where: { token: cleanToken },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!qrRecord) {
        return {
          status: "INVALID_TOKEN",
          success: false,
          message: "Invalid QR code. Record not found in system.",
        };
      }

      if (qrRecord.isRevoked || new Date() > qrRecord.expiresAt) {
        return {
          status: "EXPIRED",
          success: false,
          message: "This QR code has expired or was revoked.",
        };
      }

      const staff = qrRecord.user;
      if (!staff.isActive) {
        return {
          status: "STAFF_INACTIVE",
          success: false,
          message: `Staff member (${staff.staffId}) account is currently deactivated.`,
        };
      }

      // 2. Validate Service Date: Must match the current/expected service date
      const targetServiceDate = expectedServiceDate || getTodayServiceDate();
      if (qrRecord.serviceDate !== targetServiceDate) {
        return {
          status: "DATE_MISMATCH",
          success: false,
          message: `Service date mismatch. This QR code is issued for ${qrRecord.serviceDate}, but current service date is ${targetServiceDate}.`,
          data: {
            staffId: staff.staffId,
            staffName: staff.profile?.fullName || staff.staffId,
            department: staff.profile?.department,
            mealType: qrRecord.mealType,
            serviceDate: qrRecord.serviceDate,
          },
        };
      }

      // 3. Verify eligibility (must have OPT_IN response)
      const mealResponse = await tx.mealResponse.findUnique({
        where: {
          userId_serviceDate_mealType: {
            userId: staff.id,
            serviceDate: qrRecord.serviceDate,
            mealType: qrRecord.mealType,
          },
        },
      });

      if (!mealResponse || mealResponse.status !== "OPT_IN") {
        return {
          status: "INELIGIBLE",
          success: false,
          message: `Staff member did not request ${qrRecord.mealType} for ${qrRecord.serviceDate}.`,
          data: {
            staffId: staff.staffId,
            staffName: staff.profile?.fullName || staff.staffId,
            department: staff.profile?.department,
            mealType: qrRecord.mealType,
            serviceDate: qrRecord.serviceDate,
          },
        };
      }

      // 3. Check if already collected
      const existingCollection = await tx.mealCollection.findUnique({
        where: {
          userId_serviceDate_mealType: {
            userId: staff.id,
            serviceDate: qrRecord.serviceDate,
            mealType: qrRecord.mealType,
          },
        },
      });

      if (existingCollection) {
        return {
          status: "ALREADY_COLLECTED",
          success: false,
          message: `Already collected on ${formatIST(existingCollection.collectedAt)}. Duplicate meal denied.`,
          data: {
            staffId: staff.staffId,
            staffName: staff.profile?.fullName || staff.staffId,
            department: staff.profile?.department,
            mealType: qrRecord.mealType,
            serviceDate: qrRecord.serviceDate,
            previouslyCollectedAt: existingCollection.collectedAt,
          },
        };
      }

      // 4. Record successful collection
      const collection = await tx.mealCollection.create({
        data: {
          userId: staff.id,
          serviceDate: qrRecord.serviceDate,
          mealType: qrRecord.mealType,
          verifiedById: canteenUserId,
        },
      });

      return {
        status: "SUCCESS",
        success: true,
        message: `Successfully verified and collected ${qrRecord.mealType} for ${staff.profile?.fullName || staff.staffId}.`,
        data: {
          staffId: staff.staffId,
          staffName: staff.profile?.fullName || staff.staffId,
          department: staff.profile?.department,
          mealType: qrRecord.mealType,
          serviceDate: qrRecord.serviceDate,
          collectedAt: collection.collectedAt,
        },
      };
    });
  } catch (error: any) {
    // Unique constraint violation P2002 if two concurrent scans slipped through
    if (error?.code === "P2002") {
      return {
        status: "ALREADY_COLLECTED",
        success: false,
        message: "Meal was just collected in a concurrent transaction. Duplicate prevented.",
      };
    }
    console.error("Meal verification error:", error);
    return {
      status: "ERROR",
      success: false,
      message: "An unexpected server error occurred during verification.",
    };
  }
}

