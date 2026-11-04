import { NextResponse } from "next/server";
import { generateCohortSummaryCsv } from "@/lib/reports/pdf-renderer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawIds = url.searchParams.get("sampleIds");
    const sampleIds = rawIds ? rawIds.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

    const csvContent = await generateCohortSummaryCsv(sampleIds);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `MYGUTBIOME_COHORT_SUMMARY_${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Cohort CSV generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate cohort CSV." },
      { status: 500 }
    );
  }
}

