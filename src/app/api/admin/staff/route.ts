import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { CreateUserSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit";
import { formatIST } from "@/lib/timezone";

export async function GET() {
  const auth = await verifyApiAuth(["ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { profile: true },
  });

  const formatted = users.map((u) => ({
    id: u.id,
    staffId: u.staffId,
    role: u.role,
    isActive: u.isActive,
    mustChangePassword: u.mustChangePassword,
    fullName: u.profile?.fullName || "-",
    department: u.profile?.department || "-",
    phone: u.profile?.phone || "-",
    createdAt: formatIST(u.createdAt),
  }));

  return NextResponse.json({ users: formatted });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(["ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  try {
    const body = await req.json();
    const parsed = CreateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { staffId, fullName, department, role, initialPassword } = parsed.data;
    const cleanStaffId = staffId.toUpperCase();

    // Check unique staffId
    const existing = await prisma.user.findUnique({
      where: { staffId: cleanStaffId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Staff ID '${cleanStaffId}' is already registered.` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        staffId: cleanStaffId,
        passwordHash,
        role,
        isActive: true,
        mustChangePassword: true, // Force change on first login
        profile: {
          create: {
            fullName,
            department: department || null,
          },
        },
      },
      include: { profile: true },
    });

    await recordAuditLog({
      actorId: session.userId,
      actorStaffId: session.staffId,
      action: "USER_CREATE",
      targetType: "User",
      targetId: newUser.id,
      newValue: {
        staffId: newUser.staffId,
        role: newUser.role,
        fullName,
        department,
      },
      reason: "Admin created new account",
    });

    return NextResponse.json({
      success: true,
      message: `Account for ${cleanStaffId} created successfully.`,
      user: {
        id: newUser.id,
        staffId: newUser.staffId,
        role: newUser.role,
        fullName: newUser.profile?.fullName,
      },
    });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user account. Please check inputs and retry." },
      { status: 500 }
    );
  }
}

