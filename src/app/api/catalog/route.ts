import { NextResponse } from "next/server";
import { AMR_PANEL, DISEASES, SPECIES } from "@/lib/microbiome/catalog";
import { PROFILE_LABELS } from "@/lib/microbiome/samples";

export async function GET() {
  return NextResponse.json({
    product: "MYGUTBIOME",
    lab: "ONEOMICS",
    reportTypes: [
      {
        id: "doctor",
        name: "Doctor-centric",
        pages: "1–2",
        description:
          "Clinical alerts, AMR, pathogen screen, disease-pattern scores, and action list.",
      },
      {
        id: "patient",
        name: "Patient-centric",
        pages: "1–5",
        description:
          "Plain-language gut score, helpful microbes, what to eat, and when to call a clinician.",
      },
      {
        id: "detailed",
        name: "Detailed scientific",
        pages: "1–30",
        description:
          "QC, taxonomy, resistome, pathways, evidence tables, diet science, references, and appendix.",
      },
    ],
    communityProfiles: PROFILE_LABELS,
    catalog: {
      species: SPECIES.length,
      amrGenes: AMR_PANEL.length,
      diseaseModules: DISEASES.length,
    },
  });
}
