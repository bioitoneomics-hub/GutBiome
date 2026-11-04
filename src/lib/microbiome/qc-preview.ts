import type { BiomObservation, SampleTaxaPreview } from "./types";

export const BENEFICIAL_TAXA = [
  "faecalibacterium",
  "akkermansia",
  "bifidobacterium",
  "roseburia",
  "eubacterium rectale",
  "coprococcus",
  "lactobacillus",
  "blautia",
  "barnesiella",
  "alistipes",
];

export const HARMFUL_PATHOBIONT_TAXA = [
  "escherichia",
  "klebsiella",
  "clostridioides",
  "difficile",
  "enterococcus faecium",
  "fusobacterium",
  "bilophila",
  "salmonella",
  "pseudomonas",
  "campylobacter",
  "ruminococcus gnavus",
];

export const PHYLUM_COLOR_MAP: Record<string, string> = {
  Firmicutes: "#2d6a4f",
  Bacteroidota: "#2b5c8f",
  Bacteroidetes: "#2b5c8f",
  Actinobacteriota: "#c47a2b",
  Actinobacteria: "#c47a2b",
  Proteobacteria: "#b23a48",
  Verrucomicrobiota: "#6b4c9a",
  Verrucomicrobia: "#6b4c9a",
  Fusobacteriota: "#8d5b4c",
  Fusobacteria: "#8d5b4c",
  Euryarchaeota: "#5b7065",
};

export function classifyTaxonRole(taxon: string): {
  role: "beneficial" | "harmful" | "commensal";
  clinicalTag: string;
} {
  const lower = taxon.toLowerCase();
  for (const b of BENEFICIAL_TAXA) {
    if (lower.includes(b)) {
      if (lower.includes("faecalibacterium") || lower.includes("roseburia") || lower.includes("rectale")) {
        return { role: "beneficial", clinicalTag: "SCFA / Butyrate Producer" };
      }
      if (lower.includes("akkermansia")) {
        return { role: "beneficial", clinicalTag: "Mucosal Barrier Sentinel" };
      }
      if (lower.includes("bifidobacterium")) {
        return { role: "beneficial", clinicalTag: "Acetate / Immune Pioneer" };
      }
      return { role: "beneficial", clinicalTag: "Protective Helper" };
    }
  }
  for (const h of HARMFUL_PATHOBIONT_TAXA) {
    if (lower.includes(h)) {
      if (lower.includes("escherichia") || lower.includes("klebsiella")) {
        return { role: "harmful", clinicalTag: "Enterobacterales / AMR Risk" };
      }
      if (lower.includes("difficile")) {
        return { role: "harmful", clinicalTag: "Cytotoxin Pathogen" };
      }
      if (lower.includes("gnavus")) {
        return { role: "harmful", clinicalTag: "IBD Inflammatory Pathobiont" };
      }
      if (lower.includes("bilophila")) {
        return { role: "harmful", clinicalTag: "Sulfite Reducer / Barrier Stress" };
      }
      return { role: "harmful", clinicalTag: "Harmful Pathobiont" };
    }
  }
  return { role: "commensal", clinicalTag: "Normal" };
}

export function generateSampleTaxaPreview(
  sampleId: string,
  observations: BiomObservation[],
): SampleTaxaPreview {
  const sorted = [...observations].sort((a, b) => b.count - a.count);

  // Top 8 taxa
  const topTaxa = sorted.slice(0, 8).map((o) => {
    const classification = classifyTaxonRole(o.taxon);
    return {
      taxon: o.taxon,
      phylum: o.phylum || "Unclassified",
      family: o.family || "",
      relativeAbundance: Number(o.relativeAbundance.toFixed(2)),
      count: Math.round(o.count),
      role: classification.role,
      clinicalTag: classification.clinicalTag,
    };
  });

  // Phylum distribution
  const phylumMap = new Map<string, number>();
  for (const o of sorted) {
    const p = o.phylum || "Other / Unclassified";
    phylumMap.set(p, (phylumMap.get(p) ?? 0) + o.relativeAbundance);
  }

  const phyla = Array.from(phylumMap.entries())
    .map(([phylum, pct]) => ({
      phylum,
      percentage: Number(pct.toFixed(1)),
      color: PHYLUM_COLOR_MAP[phylum] || "#7a8885",
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6);

  // Calculate F/B ratio
  const firmicutesPct = phylumMap.get("Firmicutes") || 0;
  const bacteroidotaPct =
    (phylumMap.get("Bacteroidota") || phylumMap.get("Bacteroidetes")) || 0;
  const fbRatio =
    bacteroidotaPct > 0 ? Number((firmicutesPct / bacteroidotaPct).toFixed(2)) : undefined;

  // Derive Clinical Signals
  const signals: SampleTaxaPreview["signals"] = [];

  const proteoPct = phylumMap.get("Proteobacteria") || 0;
  if (proteoPct > 8) {
    signals.push({
      type: "warning",
      title: "Proteobacteria Bloom Detected",
      description: `Proteobacteria abundance is elevated (${proteoPct.toFixed(1)}%, ref < 4.5%), often correlated with gut oxidative stress or mucosal irritation.`,
    });
  }

  const fpTaxon = sorted.find((o) => o.taxon.toLowerCase().includes("faecalibacterium"));
  if (fpTaxon && fpTaxon.relativeAbundance >= 4.0) {
    signals.push({
      type: "positive",
      title: "Robust Butyrate Sentinel",
      description: `Faecalibacterium is abundant (${fpTaxon.relativeAbundance.toFixed(1)}%), supporting colonic epithelial barrier fuel and anti-inflammatory tone.`,
    });
  } else if (!fpTaxon || fpTaxon.relativeAbundance < 1.5) {
    signals.push({
      type: "warning",
      title: "Depleted Faecalibacterium",
      description: `Faecalibacterium is below clinical baseline (${fpTaxon ? fpTaxon.relativeAbundance.toFixed(1) : 0}%), a hallmark signature in inflammatory dysbiosis.`,
    });
  }

  const akkWax = sorted.find((o) => o.taxon.toLowerCase().includes("akkermansia"));
  if (akkWax && akkWax.relativeAbundance >= 1.0) {
    signals.push({
      type: "positive",
      title: "Intact Mucosal Shield Sentinel",
      description: `Akkermansia muciniphila detected at ${akkWax.relativeAbundance.toFixed(1)}%, consistent with adequate mucin turnover and gut lining integrity.`,
    });
  }

  const ecoliTaxon = sorted.find(
    (o) =>
      o.taxon.toLowerCase().includes("escherichia") ||
      o.taxon.toLowerCase().includes("klebsiella"),
  );
  if (ecoliTaxon && ecoliTaxon.relativeAbundance >= 1.5) {
    signals.push({
      type: "warning",
      title: "Opportunistic Pathobiont Carriage",
      description: `${ecoliTaxon.taxon} carriage detected at ${ecoliTaxon.relativeAbundance.toFixed(1)}%. CARD resistome screening recommended.`,
    });
  }

  if (fbRatio != null) {
    signals.push({
      type: "info",
      title: `Firmicutes / Bacteroidota Ratio: ${fbRatio}`,
      description:
        fbRatio > 2.5
          ? "Elevated F/B ratio (Firmicutes-dominant energy harvest profile)."
          : fbRatio < 0.8
          ? "Low F/B ratio (Bacteroidota-dominant glycan degradation profile)."
          : "Balanced eubiotic F/B equilibrium (typical healthy adult range).",
    });
  }

  return {
    sampleId,
    topTaxa,
    phyla,
    signals,
    fbRatio,
  };
}

