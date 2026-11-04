import { NextResponse } from "next/server";
import { listReportsForSample, saveReport } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sampleId = url.searchParams.get("sampleId");
    if (!sampleId) {
      return NextResponse.json({ error: "Missing required query parameter: sampleId" }, { status: 400 });
    }

    const reports = await listReportsForSample(sampleId);
    return NextResponse.json({ sampleId, reports });
  } catch (err) {
    console.error("Error fetching reports:", err);
    return NextResponse.json({ error: "Failed to fetch reports from database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.sampleId || !body.reportType) {
      return NextResponse.json({ error: "sampleId and reportType are required" }, { status: 400 });
    }

    const saved = await saveReport({
      id: body.id,
      sampleId: body.sampleId,
      reportType: body.reportType,
      status: body.status,
      signedOffBy: body.signedOffBy,
      reportPayload: body.reportPayload,
    });

    return NextResponse.json({ success: true, report: saved });
  } catch (err) {
    console.error("Error saving report to Biomine_DB:", err);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}
