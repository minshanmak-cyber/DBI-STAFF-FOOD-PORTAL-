import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession, setSessionCookie } from "@/lib/session";
import { ChangePasswordSchema, FirstLoginPasswordSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const isFirstLogin = Boolean(session.mustChangePassword || body.isFirstLogin);

    let newPassword = "";

    // Verify user exists and is active
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found or account is deactivated" }, { status: 403 });
    }

    if (isFirstLogin) {
      const parsed = FirstLoginPasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      newPassword = parsed.data.newPassword;
    } else {
      const parsed = ChangePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 }
        );
      }

      newPassword = parsed.data.newPassword;
    }

    // Hash new password and update user
    const newHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
      include: { profile: true },
    });

    // Update session cookie
    await setSessionCookie({
      userId: updatedUser.id,
      staffId: updatedUser.staffId,
      role: updatedUser.role,
      mustChangePassword: false,
      fullName: updatedUser.profile?.fullName || updatedUser.staffId,
      department: updatedUser.profile?.department,
    });

    await recordAuditLog({
      actorId: session.userId,
      actorStaffId: session.staffId,
      action: isFirstLogin ? "FIRST_LOGIN_PASSWORD_CHANGE" : "PASSWORD_CHANGE",
      targetType: "User",
      targetId: session.userId,
      reason: "User initiated password update",
    });

    let redirectTo = "/staff";
    if (updatedUser.role === "ADMIN") redirectTo = "/admin";
    if (updatedUser.role === "CANTEEN") redirectTo = "/canteen";

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      redirectTo,
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to update password. Please try again." },
      { status: 500 }
    );
  }
}

