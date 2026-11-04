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

    try {
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
    } catch (renderErr: any) {
      // If headless Chrome is not installed on the server (e.g. Vercel serverless environment),
      // seamlessly redirect to the report page with ?print=true so the client browser's
      // native high-fidelity A4 vector print engine executes automatically!
      console.warn("Serverless PDF render unavailable, redirecting to browser print:", renderErr.message);
      const targetPath = reportType === "all" ? `/reports/${sampleId}/all` : `/reports/${sampleId}/${reportType}`;
      const redirectUrl = new URL(`${targetPath}?print=true`, baseUrl);
      return NextResponse.redirect(redirectUrl, 302);
    }
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate PDF document." },
      { status: 500 }
    );
  }
}
