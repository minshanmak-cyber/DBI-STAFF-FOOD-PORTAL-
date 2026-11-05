import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { formatIST } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(["ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: {
        include: { profile: true },
      },
    },
  });

  const formatted = logs.map((log) => ({
    id: log.id,
    actorStaffId: log.actorStaffId || log.actor?.staffId || "SYSTEM",
    actorName: log.actor?.profile?.fullName || log.actorStaffId || "System",
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    previousValue: log.previousValue,
    newValue: log.newValue,
    reason: log.reason,
    createdAt: formatIST(log.createdAt),
  }));

  return NextResponse.json({ auditLogs: formatted });
}

