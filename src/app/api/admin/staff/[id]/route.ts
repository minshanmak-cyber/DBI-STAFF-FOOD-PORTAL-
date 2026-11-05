import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { UpdateUserSchema, ResetPasswordSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit";

interface RouteParams {
  params: { id: string };
}

// Update profile / active status / role
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await verifyApiAuth(["ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  try {
    const userId = params.id;
    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, department, isActive, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from deactivating themselves
    if (existingUser.id === session.userId && !isActive) {
      return NextResponse.json(
        { error: "You cannot deactivate your own administrator account." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        isActive,
        profile: {
          upsert: {
            create: {
              fullName,
              department: department || null,
            },
            update: {
              fullName,
              department: department || null,
            },
          },
        },
      },
      include: { profile: true },
    });

    await recordAuditLog({
      actorId: session.userId,
      actorStaffId: session.staffId,
      action: "USER_UPDATE",
      targetType: "User",
      targetId: userId,
      previousValue: {
        role: existingUser.role,
        isActive: existingUser.isActive,
        fullName: existingUser.profile?.fullName,
        department: existingUser.profile?.department,
      },
      newValue: {
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        fullName,
        department,
      },
      reason: "Admin updated staff profile / status",
    });

    return NextResponse.json({
      success: true,
      message: `Account ${existingUser.staffId} updated successfully.`,
      user: {
        id: updatedUser.id,
        staffId: updatedUser.staffId,
        isActive: updatedUser.isActive,
        role: updatedUser.role,
        fullName: updatedUser.profile?.fullName,
      },
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

// Reset password securely without exposing or seeing old password
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await verifyApiAuth(["ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  try {
    const userId = params.id;
    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse({ userId, ...body });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { newPassword } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: true, // Forces staff to set their own password on next login
      },
    });

    await recordAuditLog({
      actorId: session.userId,
      actorStaffId: session.staffId,
      action: "PASSWORD_RESET_BY_ADMIN",
      targetType: "User",
      targetId: userId,
      reason: "Administrator initiated password reset",
    });

    return NextResponse.json({
      success: true,
      message: `Password for ${existingUser.staffId} has been reset. They will be required to change it on next login.`,
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

