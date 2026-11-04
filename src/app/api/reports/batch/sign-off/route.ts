import { NextResponse } from "next/server";
import { signOffReport } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sampleIds: string[] = Array.isArray(body.sampleIds) ? body.sampleIds : [];
    const reportType = (body.reportType || "doctor") as "doctor" | "patient" | "detailed";
    const signedOffBy = body.signedOffBy || "Dr. Evelyn Reed, MD, FRCPath (Bulk Sign-off)";

    if (!sampleIds.length) {
      return NextResponse.json({ error: "Select at least one sample to sign off." }, { status: 400 });
    }

    const results = [];
    for (const sid of sampleIds) {
      const ok = await signOffReport(sid, reportType, signedOffBy);
      results.push({ sampleId: sid, success: ok });
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Successfully signed off ${successCount} of ${sampleIds.length} ${reportType} reports.`,
      signedCount: successCount,
      results,
    });
  } catch (err: any) {
    console.error("Batch sign-off error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process batch sign-off." },
      { status: 500 }
    );
  }
}

