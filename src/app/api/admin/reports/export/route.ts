import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { getNextServiceDate, formatIST } from "@/lib/timezone";
import {
  generateExcelReport,
  generatePdfReport,
  MealCountSummary,
  StaffResponseRow,
  CollectionLogRow,
} from "@/lib/reports";
import { MealType, ResponseStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(["ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const serviceDate = searchParams.get("serviceDate") || getNextServiceDate();
  const format = searchParams.get("format") || "excel";

  try {
    // 1. Gather all active staff
    const staffList = await prisma.user.findMany({
      where: { role: "STAFF" },
      include: {
        profile: true,
        mealResponses: {
          where: { serviceDate },
        },
      },
      orderBy: { staffId: "asc" },
    });

    const totalActiveStaff = staffList.filter((s) => s.isActive).length;

    // 2. Format staff responses
    const staffResponses: StaffResponseRow[] = staffList.map((s) => {
      const respMap: Record<string, string> = {
        BREAKFAST: "No Response",
        LUNCH: "No Response",
        DINNER: "No Response",
      };
      let latestUpdated: Date | null = null;

      s.mealResponses.forEach((r) => {
        if (r.status === ResponseStatus.OPT_IN) respMap[r.mealType] = "OPT-IN";
        else if (r.status === ResponseStatus.OPT_OUT) respMap[r.mealType] = "OPT-OUT";
        if (!latestUpdated || r.updatedAt > latestUpdated) latestUpdated = r.updatedAt;
      });

      return {
        staffId: s.staffId,
        fullName: s.profile?.fullName || "-",
        department: s.profile?.department || "-",
        breakfast: respMap.BREAKFAST,
        lunch: respMap.LUNCH,
        dinner: respMap.DINNER,
        updatedAt: latestUpdated ? formatIST(latestUpdated) : "-",
      };
    });

    // 3. Count meals
    let breakfastOptIn = 0;
    let lunchOptIn = 0;
    let dinnerOptIn = 0;
    let respondedStaffCount = 0;

    staffList.forEach((s) => {
      let staffResponded = false;
      s.mealResponses.forEach((r) => {
        if (r.status === ResponseStatus.OPT_IN || r.status === ResponseStatus.OPT_OUT) {
          staffResponded = true;
        }
        if (r.status === ResponseStatus.OPT_IN) {
          if (r.mealType === MealType.BREAKFAST) breakfastOptIn++;
          if (r.mealType === MealType.LUNCH) lunchOptIn++;
          if (r.mealType === MealType.DINNER) dinnerOptIn++;
        }
      });
      if (staffResponded) respondedStaffCount++;
    });

    // 4. Gather collections
    const collections = await prisma.mealCollection.findMany({
      where: { serviceDate },
      include: {
        user: { include: { profile: true } },
        verifiedBy: { include: { profile: true } },
      },
      orderBy: { collectedAt: "asc" },
    });

    const breakfastCollected = collections.filter(
      (c) => c.mealType === MealType.BREAKFAST
    ).length;
    const lunchCollected = collections.filter(
      (c) => c.mealType === MealType.LUNCH
    ).length;
    const dinnerCollected = collections.filter(
      (c) => c.mealType === MealType.DINNER
    ).length;

    const collectionLogs: CollectionLogRow[] = collections.map((c) => ({
      staffId: c.user.staffId,
      fullName: c.user.profile?.fullName || c.user.staffId,
      department: c.user.profile?.department || "-",
      mealType: c.mealType,
      collectedAt: formatIST(c.collectedAt),
      canteenOperator: c.verifiedBy.profile?.fullName || c.verifiedBy.staffId,
    }));

    const summary: MealCountSummary = {
      serviceDate,
      totalActiveStaff,
      breakfastOptIn,
      breakfastCollected,
      lunchOptIn,
      lunchCollected,
      dinnerOptIn,
      dinnerCollected,
      respondedCount: respondedStaffCount,
      noResponseCount: Math.max(0, totalActiveStaff - respondedStaffCount),
    };

    if (format.toLowerCase() === "pdf") {
      const pdfBuffer = generatePdfReport({
        serviceDate,
        summary,
        staffResponses,
        collections: collectionLogs,
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="DBI-Food-Report-${serviceDate}.pdf"`,
        },
      });
    }

    // Default: Excel export
    const excelBuffer = await generateExcelReport({
      serviceDate,
      summary,
      staffResponses,
      collections: collectionLogs,
    });

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="DBI-Food-Report-${serviceDate}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report export" },
      { status: 500 }
    );
  }
}
