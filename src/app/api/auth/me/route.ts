import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json(
      { authenticated: false, error: "Account inactive or removed" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      staffId: user.staffId,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      fullName: user.profile?.fullName || user.staffId,
      department: user.profile?.department,
    },
  });
}

