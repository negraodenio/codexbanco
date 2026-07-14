import { NextResponse } from "next/server";
import { runFraudPipeline } from "@/lib/fraud/pipeline/fraudPipeline";

export async function POST(request: Request) {
  const formData = await request.formData();
  const applicantName = String(formData.get("applicantName") ?? "Unknown Applicant");
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);
  if (!files.length) return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
  if (files.some((file) => file.size > 10 * 1024 * 1024)) {
    return NextResponse.json({ error: "File size exceeds 10MB limit." }, { status: 413 });
  }

  const result = await runFraudPipeline({
    applicantName,
    files: await Promise.all(
      files.map(async (file) => ({
        originalFilename: file.name,
        declaredMimeType: file.type || "application/octet-stream",
        buffer: Buffer.from(await file.arrayBuffer())
      }))
    )
  });
  return NextResponse.json(result);
}

