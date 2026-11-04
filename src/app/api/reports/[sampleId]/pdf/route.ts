import { NextResponse } from "next/server";
import { getSample } from "@/lib/store";
import type { ReportType } from "@/lib/microbiome/types";
import { renderReportPdf } from "@/lib/reports/pdf-renderer";

export async function GET(
  request: Request,
  context: { params: Promise<{ sampleId: string }> }
) {
  try {
    const { sampleId } = await context.params;
    const sample = await getSample(sampleId);
    if (!sample) {
      return NextResponse.json({ error: "Sample not found." }, { status: 404 });
    }

    const url = new URL(request.url);
    const typeParam = url.searchParams.get("type") || "doctor";
    const reportType = (["doctor", "patient", "detailed", "all"].includes(typeParam)
      ? typeParam
      : "doctor") as ReportType | "all";

    const host = request.headers.get("host") || "localhost:43123";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const { buffer, filename } = await renderReportPdf(sampleId, reportType, baseUrl);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate PDF document." },
      { status: 500 }
    );
  }
}
