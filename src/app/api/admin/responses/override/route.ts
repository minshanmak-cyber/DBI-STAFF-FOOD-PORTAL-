import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { AdminOverrideMealResponseSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit";
import { ResponseStatus, MealType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(["ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  try {
    const body = await req.json();
    const parsed = AdminOverrideMealResponseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, serviceDate, mealType, status, reason } = parsed.data;

    // Verify user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Lookup previous response
    const existing = await prisma.mealResponse.findUnique({
      where: {
        userId_serviceDate_mealType: {
          userId,
          serviceDate,
          mealType: mealType as MealType,
        },
      },
    });

    const previousStatus = existing ? existing.status : "NO_RESPONSE";

    // Perform update/upsert
    const updated = await prisma.mealResponse.upsert({
      where: {
        userId_serviceDate_mealType: {
          userId,
          serviceDate,
          mealType: mealType as MealType,
        },
      },
      update: {
        status: status as ResponseStatus,
        editedById: session.userId,
      },
      create: {
        userId,
        serviceDate,
        mealType: mealType as MealType,
        status: status as ResponseStatus,
        editedById: session.userId,
      },
    });

    // Write audit log
    await recordAuditLog({
      actorId: session.userId,
      actorStaffId: session.staffId,
      action: "ADMIN_RESPONSE_OVERRIDE",
      targetType: "MealResponse",
      targetId: updated.id,
      previousValue: {
        staffId: targetUser.staffId,
        serviceDate,
        mealType,
        status: previousStatus,
      },
      newValue: {
        staffId: targetUser.staffId,
        serviceDate,
        mealType,
        status,
      },
      reason,
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${targetUser.staffId}'s ${mealType} response for ${serviceDate} to ${status}.`,
      response: updated,
    });
  } catch (error) {
    console.error("Admin override response error:", error);
    return NextResponse.json(
      { error: "Failed to override response. Please try again." },
      { status: 500 }
    );
  }
}

