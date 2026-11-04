import { NextResponse } from "next/server";
import type { ReportType } from "@/lib/microbiome/types";
import {
  renderBatchPdfs,
  generateCohortSummaryCsv,
  createBatchReportsZip,
} from "@/lib/reports/pdf-renderer";
import { listSamples } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 120; // Allow sufficient time for batch PDF compilation

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const reportType = (["doctor", "patient", "detailed", "all"].includes(body.reportType)
      ? body.reportType
      : "doctor") as ReportType | "all";

    let sampleIds: string[] = Array.isArray(body.sampleIds) ? body.sampleIds : [];

    // If no sample IDs provided, export all accessioned samples
    if (!sampleIds.length) {
      const all = await listSamples();
      sampleIds = all.map((s) => s.id);
    }

    if (!sampleIds.length) {
      return NextResponse.json({ error: "No samples available for batch export." }, { status: 400 });
    }

    const host = request.headers.get("host") || "localhost:43123";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    // 1. Render all requested PDFs
    const pdfItems = await renderBatchPdfs(sampleIds, reportType, baseUrl);

    // 2. Generate Cohort Summary CSV
    const csvContent = body.includeCsv !== false ? await generateCohortSummaryCsv(sampleIds) : undefined;

    // 3. Package into high-efficiency ZIP archive
    const zipBuffer = await createBatchReportsZip({
      pdfs: pdfItems,
      csvContent,
      reportType,
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `MYGUTBIOME_BATCH_${reportType.toUpperCase()}_${sampleIds.length}SAMPLES_${timestamp}.zip`;

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Batch PDF export error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate batch reports ZIP." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const typeParam = url.searchParams.get("type") || "doctor";
  const reportType = (["doctor", "patient", "detailed", "all"].includes(typeParam)
    ? typeParam
    : "doctor") as ReportType | "all";

  const rawIds = url.searchParams.get("sampleIds");
  const sampleIds = rawIds ? rawIds.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const host = request.headers.get("host") || "localhost:43123";
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  try {
    const targetIds = sampleIds.length ? sampleIds : (await listSamples()).map((s) => s.id);
    const pdfItems = await renderBatchPdfs(targetIds, reportType, baseUrl);
    const csvContent = await generateCohortSummaryCsv(targetIds);

    const zipBuffer = await createBatchReportsZip({
      pdfs: pdfItems,
      csvContent,
      reportType,
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `MYGUTBIOME_BATCH_${reportType.toUpperCase()}_${targetIds.length}SAMPLES_${timestamp}.zip`;

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Batch PDF export error (GET):", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate batch reports ZIP." },
      { status: 500 }
    );
  }
}
