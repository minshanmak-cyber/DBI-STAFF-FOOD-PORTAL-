import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";
import { setSessionCookie } from "@/lib/session";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
} from "@/lib/rate-limit";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { staffId, password } = result.data;
    const clientIdentifier = `${staffId.toUpperCase()}`;

    // Rate limit check
    const rateCheck = checkLoginRateLimit(clientIdentifier);
    if (rateCheck.isBlocked) {
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to repeated failed attempts. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // Lookup user
    const user = await prisma.user.findUnique({
      where: { staffId: staffId.toUpperCase() },
      include: { profile: true },
    });

    if (!user) {
      const failInfo = recordFailedLoginAttempt(clientIdentifier);
      return NextResponse.json(
        {
          error: "Invalid Staff ID or password",
          remainingAttempts: failInfo.remainingAttempts,
        },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account is deactivated. Please contact an administrator." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const failInfo = recordFailedLoginAttempt(clientIdentifier);
      return NextResponse.json(
        {
          error: "Invalid Staff ID or password",
          remainingAttempts: failInfo.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Reset rate limiter on success
    resetLoginRateLimit(clientIdentifier);

    // Set secure HTTP-only cookie
    await setSessionCookie({
      userId: user.id,
      staffId: user.staffId,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      fullName: user.profile?.fullName || user.staffId,
      department: user.profile?.department,
    });

    // Determine redirect
    let redirectTo = "/staff";
    if (user.mustChangePassword) {
      redirectTo = "/change-password?firstLogin=true";
    } else if (user.role === "ADMIN") {
      redirectTo = "/admin";
    } else if (user.role === "CANTEEN") {
      redirectTo = "/canteen";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        staffId: user.staffId,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        fullName: user.profile?.fullName || user.staffId,
      },
      redirectTo,
    });
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}

