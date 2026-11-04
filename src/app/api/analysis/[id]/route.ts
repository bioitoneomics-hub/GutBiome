import { NextResponse } from "next/server";
import { analyzeSample } from "@/lib/microbiome/engine";
import { getBiomTable, getSample } from "@/lib/store";
import type { ReportType } from "@/lib/microbiome/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const sample = await getSample(id);
    if (!sample) {
      return NextResponse.json({ error: "Sample not found." }, { status: 404 });
    }
    const url = new URL(request.url);
    const type = (url.searchParams.get("type") ?? "doctor") as ReportType;
    if (!["doctor", "patient", "detailed"].includes(type)) {
      return NextResponse.json({ error: "Unknown report type." }, { status: 400 });
    }
    const biom = await getBiomTable(id);
    const analysis = analyzeSample(sample, biom);
    const pageTarget = type === "doctor" ? "1–2" : type === "patient" ? "1–5" : "1–30";
    return NextResponse.json({
      type,
      pageTarget,
      product: "MYGUTBIOME",
      lab: "ONEOMICS",
      analysis,
    });
  } catch (err) {
    console.error("Error generating analysis JSON:", err);
    return NextResponse.json({ error: "Failed to generate microbiome analysis" }, { status: 500 });
  }
}
