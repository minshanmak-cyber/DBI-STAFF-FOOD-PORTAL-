import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/auth-guard";
import { VerifyCollectionSchema } from "@/lib/validations";
import { verifyAndCollectMeal } from "@/lib/qr";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(["CANTEEN", "ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  try {
    const body = await req.json();
    const parsed = VerifyCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid QR code payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { qrToken } = parsed.data;
    const result = await verifyAndCollectMeal(qrToken, session.userId);

    if (result.success && result.data) {
      await recordAuditLog({
        actorId: session.userId,
        actorStaffId: session.staffId,
        action: "MEAL_COLLECTION_VERIFIED",
        targetType: "MealCollection",
        targetId: result.data.staffId,
        newValue: {
          staffId: result.data.staffId,
          mealType: result.data.mealType,
          serviceDate: result.data.serviceDate,
        },
        reason: "Canteen operator QR verification",
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Canteen verify route error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        success: false,
        message: "An unexpected error occurred during verification",
      },
      { status: 500 }
    );
  }
}

