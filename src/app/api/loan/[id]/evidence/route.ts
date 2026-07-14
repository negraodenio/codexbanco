import { NextResponse } from "next/server";
import { getApplication } from "@/lib/data/localRepository";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const application = await getApplication(id);
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  return NextResponse.json({
    redFlags: application.redFlags,
    validationResults: application.validationResults,
    crossDocumentChecks: application.crossDocumentChecks,
    extractions: application.extractions
  });
}

