import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { getNextServiceDate, formatServiceDateDisplay, formatIST } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(["ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const serviceDate = searchParams.get("serviceDate") || getNextServiceDate();

  // Get all active staff users
  const staffUsers = await prisma.user.findMany({
    where: {
      role: "STAFF",
    },
    include: {
      profile: true,
      mealResponses: {
        where: { serviceDate },
      },
    },
    orderBy: { staffId: "asc" },
  });

  const staffRows = staffUsers.map((staff) => {
    const respMap: Record<string, string> = {
      BREAKFAST: "NO_RESPONSE",
      LUNCH: "NO_RESPONSE",
      DINNER: "NO_RESPONSE",
    };

    let latestUpdated: Date | null = null;

    staff.mealResponses.forEach((r) => {
      respMap[r.mealType] = r.status;
      if (!latestUpdated || r.updatedAt > latestUpdated) {
        latestUpdated = r.updatedAt;
      }
    });

    const hasResponded = Object.values(respMap).some((s) => s !== "NO_RESPONSE");

    return {
      userId: staff.id,
      staffId: staff.staffId,
      fullName: staff.profile?.fullName || "-",
      department: staff.profile?.department || "-",
      isActive: staff.isActive,
      hasResponded,
      breakfast: respMap.BREAKFAST,
      lunch: respMap.LUNCH,
      dinner: respMap.DINNER,
      updatedAt: latestUpdated ? formatIST(latestUpdated) : "-",
    };
  });

  return NextResponse.json({
    serviceDate,
    serviceDateDisplay: formatServiceDateDisplay(serviceDate),
    staffResponses: staffRows,
  });
}

