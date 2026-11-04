import { NextResponse } from "next/server";
import { BiomParseError, parseBiomFile } from "@/lib/microbiome/biom";
import { analyzeSample } from "@/lib/microbiome/engine";
import { createSampleFromBiom } from "@/lib/store";
import type { Sex } from "@/lib/microbiome/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a BIOM or OTU table file." }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File is larger than 50 MB." }, { status: 413 });
  }

  let parsed;
  try {
    parsed = parseBiomFile(Buffer.from(await file.arrayBuffer()), file.name);
  } catch (err) {
    const message =
      err instanceof BiomParseError || (err instanceof Error && err.name === "FastqParseError")
        ? err.message
        : "Could not parse the file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const requested = String(form.get("biomSampleId") ?? "").trim();
  const sampleId = requested && parsed.columns.has(requested) ? requested : parsed.preview.sampleIds[0];
  if (!sampleId) {
    return NextResponse.json({ error: "No sample columns found in the table." }, { status: 400 });
  }
  const biom = parsed.columns.get(sampleId);
  if (!biom) {
    return NextResponse.json({ error: "Selected BIOM sample was not found." }, { status: 400 });
  }

  const sexRaw = String(form.get("sex") ?? "unspecified");
  const sex: Sex = sexRaw === "female" || sexRaw === "male" ? sexRaw : "unspecified";

  const sample = await createSampleFromBiom({
    displayName: String(form.get("displayName") ?? ""),
    age: Number(form.get("age")) || 40,
    sex,
    indication: String(form.get("indication") ?? ""),
    recentAntibiotics: form.get("recentAntibiotics") === "true" || form.get("recentAntibiotics") === "on",
    dietPattern: String(form.get("dietPattern") ?? ""),
    patientCode: form.get("patientCode") ? String(form.get("patientCode")) : undefined,
    biom,
  });

  const analysis = analyzeSample(sample, biom);
  return NextResponse.json(
    {
      sample,
      reports: {
        doctor: `/reports/${sample.id}/doctor`,
        patient: `/reports/${sample.id}/patient`,
        detailed: `/reports/${sample.id}/detailed`,
        all: `/reports/${sample.id}/all`,
        hub: `/reports/${sample.id}`,
      },
      analysis: {
        gutScore: analysis.gutScore,
        shannon: analysis.diversity.shannon,
        amrCalls: analysis.amr.length,
        pathogens: analysis.pathogens.filter((p) => p.relativeAbundance > 0).length,
        observedFeatures: biom.observations.length,
      },
    },
    { status: 201 },
  );
}
