import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const envCheck = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlPrefix: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.slice(0, 16) + "..."
      : "MISSING",
    hasSessionSecret: Boolean(process.env.SESSION_SECRET),
    timezone: process.env.APP_TIMEZONE || "not set",
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      userCount,
      env: envCheck,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        errorMessage: error?.message || String(error),
        errorCode: error?.code,
        env: envCheck,
      },
      { status: 500 }
    );
  }
}
