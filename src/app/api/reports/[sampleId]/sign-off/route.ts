import { NextResponse } from "next/server";
import { getReportRecord, signOffReport } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ sampleId: string }> }
) {
  try {
    const { sampleId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reportType = (body.reportType || "doctor") as "doctor" | "patient" | "detailed";
    const signedOffBy = body.signedOffBy || "Dr. Evelyn Reed, MD, FRCPath";

    const success = await signOffReport(sampleId, reportType, signedOffBy);
    if (!success) {
      return NextResponse.json({ error: "Failed to sign off report." }, { status: 400 });
    }

    const updated = await getReportRecord(sampleId, reportType);
    return NextResponse.json({
      success: true,
      message: `Report ${reportType} signed off for sample ${sampleId}`,
      report: updated,
    });
  } catch (err) {
    console.error("Error signing off report:", err);
    return NextResponse.json({ error: "Failed to sign off report in database" }, { status: 500 });
  }
}
