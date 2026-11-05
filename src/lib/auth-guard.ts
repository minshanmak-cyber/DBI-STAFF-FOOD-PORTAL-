import { getSession, SessionPayload, clearSessionCookie } from "./session";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * For Server Components: guarantees an active session, redirects to /login if missing or inactive.
 */
export async function requirePageAuth(allowedRoles?: Role[]): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Verify in database that user still exists and is active
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isActive: true, mustChangePassword: true, role: true },
  });

  if (!dbUser || !dbUser.isActive) {
    await clearSessionCookie();
    redirect("/login?deactivated=true");
  }

  if (dbUser.mustChangePassword) {
    redirect("/change-password?firstLogin=true");
  }

  if (allowedRoles && !allowedRoles.includes(dbUser.role as Role)) {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * For Route Handlers / API routes: returns session or an HTTP error response.
 * Enforces database active status and password change requirement.
 */
export async function verifyApiAuth(
  allowedRoles?: Role[],
  allowPendingPasswordChange = false
): Promise<{ session: SessionPayload } | { errorResponse: NextResponse }> {
  const session = await getSession();

  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Database verification: verify user is currently active
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isActive: true, mustChangePassword: true, role: true },
  });

  if (!dbUser || !dbUser.isActive) {
    await clearSessionCookie();
    return {
      errorResponse: NextResponse.json(
        { error: "Account is inactive or has been deactivated by an administrator." },
        { status: 403 }
      ),
    };
  }

  // If user must change password, block other API actions until updated
  if (dbUser.mustChangePassword && !allowPendingPasswordChange) {
    return {
      errorResponse: NextResponse.json(
        { error: "Mandatory password change required on first login before accessing portal actions." },
        { status: 403 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(dbUser.role as Role)) {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden: You do not have permission to access this resource." },
        { status: 403 }
      ),
    };
  }

  return { session };
}

/**
 * Verifies that the authenticated user either owns the resource (STAFF)
 * or has administrative privileges. Prevents IDOR.
 */
export function checkStaffOwnershipOrAdmin(
  session: SessionPayload,
  targetUserId: string
): boolean {
  if (session.role === "ADMIN") return true;
  return session.userId === targetUserId;
}
