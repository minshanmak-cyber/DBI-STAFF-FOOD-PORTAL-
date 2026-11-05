import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { SubmitMealPreferencesSchema } from "@/lib/validations";
import {
  checkStaffMealEditEligibility,
  getNextServiceDate,
  formatServiceDateDisplay,
} from "@/lib/timezone";
import { ResponseStatus, MealType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(["STAFF", "ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const { searchParams } = new URL(req.url);
  const targetDate = searchParams.get("serviceDate") || getNextServiceDate();

  const eligibility = checkStaffMealEditEligibility(targetDate);

  const responses = await prisma.mealResponse.findMany({
    where: {
      userId: session.userId,
      serviceDate: targetDate,
    },
  });

  const responseMap: Record<string, string> = {
    BREAKFAST: "NO_RESPONSE",
    LUNCH: "NO_RESPONSE",
    DINNER: "NO_RESPONSE",
  };

  responses.forEach((r) => {
    responseMap[r.mealType] = r.status;
  });

  return NextResponse.json({
    serviceDate: targetDate,
    serviceDateDisplay: formatServiceDateDisplay(targetDate),
    eligibility,
    responses: responseMap,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(["STAFF"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  try {
    const body = await req.json();
    const parsed = SubmitMealPreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission data", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { serviceDate, selections } = parsed.data;

    // Strict 3:00 PM IST server-side cutoff check
    const eligibility = checkStaffMealEditEligibility(serviceDate);
    if (!eligibility.allowed) {
      return NextResponse.json(
        {
          error: eligibility.reason || "The deadline for this service date has passed. Edits are locked.",
          deadlineDisplay: eligibility.deadlineDisplay,
        },
        { status: 403 }
      );
    }

    // Upsert meal responses atomically and synchronize QR token validity
    await prisma.$transaction(async (tx) => {
      for (const sel of selections) {
        await tx.mealResponse.upsert({
          where: {
            userId_serviceDate_mealType: {
              userId: session.userId,
              serviceDate,
              mealType: sel.mealType as MealType,
            },
          },
          update: {
            status: sel.status as ResponseStatus,
            editedById: session.userId,
          },
          create: {
            userId: session.userId,
            serviceDate,
            mealType: sel.mealType as MealType,
            status: sel.status as ResponseStatus,
            editedById: session.userId,
          },
        });

        // If user changed away from OPT_IN, revoke any existing QR pass
        if (sel.status !== "OPT_IN") {
          await tx.qrToken.updateMany({
            where: {
              userId: session.userId,
              serviceDate,
              mealType: sel.mealType as MealType,
            },
            data: { isRevoked: true },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Meal preferences saved successfully",
      serviceDate,
    });
  } catch (error) {
    console.error("Staff meal submission error:", error);
    return NextResponse.json(
      { error: "Failed to record meal choices. Please try again." },
      { status: 500 }
    );
  }
}

