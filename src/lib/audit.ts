import { prisma } from "./prisma";

export interface LogAuditParams {
  actorId?: string | null;
  actorStaffId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  reason?: string | null;
}

/**
 * Records an audit trail log while stripping sensitive fields like passwords and secret tokens.
 */
export async function recordAuditLog(params: LogAuditParams): Promise<void> {
  try {
    const sanitize = (obj?: Record<string, unknown> | null) => {
      if (!obj) return null;
      const copy = { ...obj };
      const sensitiveKeys = ["password", "passwordHash", "token", "initialPassword", "newPassword"];
      for (const key of sensitiveKeys) {
        if (key in copy) {
          copy[key] = "[REDACTED]";
        }
      }
      return JSON.stringify(copy);
    };

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorStaffId: params.actorStaffId || null,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId || null,
        previousValue: sanitize(params.previousValue),
        newValue: sanitize(params.newValue),
        reason: params.reason || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Don't crash the main transaction if audit logging encounters a secondary non-critical issue
  }
}

