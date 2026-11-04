import { NextResponse } from "next/server";
import { createSample, getBiomTable, listSamples } from "@/lib/store";
import { analyzeSample } from "@/lib/microbiome/engine";
import type { SampleProfileId, Sex } from "@/lib/microbiome/types";

export async function GET() {
  try {
    const samples = await listSamples();
    const sampleAnalyses = await Promise.all(
      samples.map(async (s) => {
        const biom = await getBiomTable(s.id);
        return {
          s,
          a: analyzeSample(s, biom),
        };
      })
    );

    const counts = {
      all: samples.length,
      amr: sampleAnalyses.filter((it) => it.a.amr.some((x) => x.level === "critical" || x.level === "high")).length,
      biom: samples.filter((s) => s.source === "biom").length,
      elevated: sampleAnalyses.filter((it) => it.a.diseases.some((d) => d.band === "elevated")).length,
      healthy: sampleAnalyses.filter((it) => it.a.gutScore >= 75 || it.s.profileId === "healthy").length,
    };

    return NextResponse.json({ samples, counts });
  } catch (err) {
    console.error("Error fetching samples:", err);
    return NextResponse.json({ error: "Failed to fetch samples from database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profileId = body.profileId as SampleProfileId;
    const allowed: SampleProfileId[] = [
      "dysbiosis-amr",
      "healthy",
      "metabolic",
      "post-antibiotic",
    ];
    if (!allowed.includes(profileId)) {
      return NextResponse.json({ error: "Unknown community profile." }, { status: 400 });
    }
    const sex: Sex =
      body.sex === "female" || body.sex === "male" ? body.sex : "unspecified";
    const sample = await createSample({
      displayName: String(body.displayName ?? ""),
      age: Number(body.age) || 40,
      sex,
      indication: String(body.indication ?? ""),
      profileId,
      recentAntibiotics: Boolean(body.recentAntibiotics),
      dietPattern: String(body.dietPattern ?? ""),
      patientCode: body.patientCode ? String(body.patientCode) : undefined,
    });
    return NextResponse.json({ sample }, { status: 201 });
  } catch (err) {
    console.error("Error creating sample:", err);
    return NextResponse.json({ error: "Failed to create sample in database" }, { status: 500 });
  }
}
