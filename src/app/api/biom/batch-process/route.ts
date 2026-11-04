import { NextResponse } from "next/server";
import { BiomParseError, parseBiomFile } from "@/lib/microbiome/biom";
import { analyzeSample } from "@/lib/microbiome/engine";
import { createSampleFromBiom } from "@/lib/store";
import type { Sex } from "@/lib/microbiome/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a valid BIOM or OTU table file." }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File is larger than 50 MB." }, { status: 413 });
  }

  let parsed;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    parsed = parseBiomFile(buf, file.name);
  } catch (err) {
    const message =
      err instanceof BiomParseError || (err instanceof Error && err.name === "FastqParseError")
        ? err.message
        : "Could not parse the multi-sample file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const detectedIds = parsed.preview.sampleIds;
  if (!detectedIds.length) {
    return NextResponse.json({ error: "No sample columns found in the table." }, { status: 400 });
  }

  // Parse requested sample IDs (or default to all detected columns)
  let targetIds = detectedIds;
  const requestedRaw = form.get("sampleIds");
  if (requestedRaw) {
    try {
      const parsedIds = typeof requestedRaw === "string" && requestedRaw.startsWith("[")
        ? JSON.parse(requestedRaw)
        : String(requestedRaw).split(",").map((s) => s.trim());
      if (Array.isArray(parsedIds) && parsedIds.length > 0) {
        targetIds = parsedIds.filter((id) => detectedIds.includes(id));
      }
    } catch {
      // Fallback to all detected
    }
  }

  const defaultIndication = String(form.get("indication") ?? "High-Throughput Cohort Metagenomic Screening");
  const defaultDiet = String(form.get("dietPattern") ?? "Not specified");
  const defaultAntibiotics = form.get("recentAntibiotics") === "true" || form.get("recentAntibiotics") === "on";
  const defaultAge = Number(form.get("age")) || 42;
  const defaultSexRaw = String(form.get("sex") ?? "unspecified");
  const defaultSex: Sex = defaultSexRaw === "female" || defaultSexRaw === "male" ? defaultSexRaw : "unspecified";

  // Optional overrides per sample
  let metadataOverrides: Record<string, any> = {};
  const overridesRaw = form.get("metadataOverrides");
  if (overridesRaw && typeof overridesRaw === "string") {
    try {
      metadataOverrides = JSON.parse(overridesRaw);
    } catch {
      metadataOverrides = {};
    }
  }

  const processedResults = [];
  const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;

  for (let idx = 0; idx < targetIds.length; idx++) {
    const sid = targetIds[idx];
    const biom = parsed.columns.get(sid);
    if (!biom) continue;

    const override = metadataOverrides[sid] || {};
    const isIbd = sid.toLowerCase().includes("ibd");
    const isWellness = sid.toLowerCase().includes("wellness");

    const displayName =
      override.displayName ||
      (isIbd
        ? `Adult, IBD Cohort (${sid})`
        : isWellness
        ? `Adult, Wellness Baseline (${sid})`
        : `Cohort Sample ${sid}`);

    const patientCode = override.patientCode || `ONC-C${idx + 1}-${sid.slice(0, 4).toUpperCase()}`;
    const indication = override.indication || defaultIndication;
    const dietPattern = override.dietPattern || defaultDiet;
    const age = override.age || defaultAge;
    const sex = override.sex || defaultSex;
    const recentAntibiotics = override.recentAntibiotics !== undefined ? override.recentAntibiotics : defaultAntibiotics;

    const sample = await createSampleFromBiom({
      displayName,
      patientCode,
      age,
      sex,
      indication,
      recentAntibiotics,
      dietPattern,
      biom,
    });

    const analysis = analyzeSample(sample, biom);

    processedResults.push({
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
        amrCount: analysis.amr.length,
        criticalAmr: analysis.amr.filter((a) => a.level === "critical" || a.level === "high").length,
        fbRatio: analysis.diversity.firmicutesBacteroidota,
        pathogenCount: analysis.pathogens.filter((p) => p.relativeAbundance > 0).length,
      },
    });
  }

  return NextResponse.json(
    {
      success: true,
      batchId,
      totalProcessed: processedResults.length,
      reportsGenerated: processedResults.length * 3,
      samples: processedResults,
    },
    { status: 201 }
  );
}
