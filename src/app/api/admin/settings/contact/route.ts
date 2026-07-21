import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const setting = await db.setting.findUnique({
      where: { key: "contact" },
    });

    if (!setting) {
      return NextResponse.json({
        editorial: {},
        manager: {},
        team: [],
      });
    }

    return NextResponse.json(JSON.parse(setting.value));
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
