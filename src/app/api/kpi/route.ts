import { NextResponse } from "next/server";
import { getKpis } from "@/lib/data/localRepository";

export async function GET() {
  return NextResponse.json(await getKpis());
}

