import { NextResponse } from "next/server";
import { getApplication } from "@/lib/data/localRepository";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const application = await getApplication(id);
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  return NextResponse.json(application);
}

