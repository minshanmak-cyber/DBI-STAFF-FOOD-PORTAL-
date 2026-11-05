import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { getNextServiceDate, formatServiceDateDisplay } from "@/lib/timezone";
import { MealType, ResponseStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(["ADMIN", "CANTEEN"]);
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const serviceDate = searchParams.get("serviceDate") || getNextServiceDate();

  // 1. Total active staff
  const totalActiveStaff = await prisma.user.count({
    where: {
      isActive: true,
      role: "STAFF",
    },
  });

  // 2. Fetch all responses for this serviceDate
  const responses = await prisma.mealResponse.findMany({
    where: {
      serviceDate,
      user: {
        isActive: true,
        role: "STAFF",
      },
    },
  });

  // Count distinct staff who responded with OPT_IN or OPT_OUT
  const staffWithResponses = new Set(
    responses
      .filter((r) => r.status === "OPT_IN" || r.status === "OPT_OUT")
      .map((r) => r.userId)
  );

  const respondedCount = staffWithResponses.size;
  const noResponseCount = Math.max(0, totalActiveStaff - respondedCount);

  // 3. Count meals by type
  const countMeal = (type: MealType) => {
    const mealResps = responses.filter((r) => r.mealType === type);
    const optIn = mealResps.filter((r) => r.status === ResponseStatus.OPT_IN).length;
    const optOut = mealResps.filter((r) => r.status === ResponseStatus.OPT_OUT).length;
    const notResponded = totalActiveStaff - (optIn + optOut);
    return {
      optIn,
      optOut,
      notResponded: Math.max(0, notResponded),
    };
  };

  const breakfastCounts = countMeal(MealType.BREAKFAST);
  const lunchCounts = countMeal(MealType.LUNCH);
  const dinnerCounts = countMeal(MealType.DINNER);

  // 4. Fetch collections for this serviceDate
  const collections = await prisma.mealCollection.findMany({
    where: { serviceDate },
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

  return NextResponse.json({
    serviceDate,
    serviceDateDisplay: formatServiceDateDisplay(serviceDate),
    totalActiveStaff,
    respondedCount,
    noResponseCount,
    meals: {
      breakfast: {
        requested: breakfastCounts.optIn,
        optOut: breakfastCounts.optOut,
        collected: breakfastCollected,
        pending: Math.max(0, breakfastCounts.optIn - breakfastCollected),
      },
      lunch: {
        requested: lunchCounts.optIn,
        optOut: lunchCounts.optOut,
        collected: lunchCollected,
        pending: Math.max(0, lunchCounts.optIn - lunchCollected),
      },
      dinner: {
        requested: dinnerCounts.optIn,
        optOut: dinnerCounts.optOut,
        collected: dinnerCollected,
        pending: Math.max(0, dinnerCounts.optIn - dinnerCollected),
      },
    },
  });
}

