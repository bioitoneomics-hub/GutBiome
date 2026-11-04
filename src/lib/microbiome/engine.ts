import { AMR_PANEL, DISEASES, GMHI_HEALTHY_SPECIES, GMHI_NON_HEALTHY_SPECIES, LAB, PATHWAYS, SPECIES } from "./catalog";
import type {
  AlertLevel,
  AmrFinding,
  Analysis,
  BiomColumnData,
  DietItem,
  DiseaseScore,
  GmhiScore,
  OrganismHit,
  SampleInput,
  SampleProfileId,
} from "./types";

type Weights = {
  diversity: number;
  inflammation: number;
  proteobacteria: number;
  akkermansia: number;
  bifido: number;
  faecalibacterium: number;
  methane: number;
  amrLoad: number;
  fiber: number;
  fat: number;
};

const PROFILE_WEIGHTS: Record<Exclude<SampleProfileId, "biom-upload">, Weights> = {
  "dysbiosis-amr": {
    diversity: 0.45,
    inflammation: 0.9,
    proteobacteria: 0.85,
    akkermansia: 0.35,
    bifido: 0.3,
    faecalibacterium: 0.25,
    methane: 0.2,
    amrLoad: 0.95,
    fiber: 0.3,
    fat: 0.7,
  },
  healthy: {
    diversity: 0.92,
    inflammation: 0.15,
    proteobacteria: 0.12,
    akkermansia: 0.8,
    bifido: 0.75,
    faecalibacterium: 0.85,
    methane: 0.25,
    amrLoad: 0.08,
    fiber: 0.85,
    fat: 0.3,
  },
  metabolic: {
    diversity: 0.55,
    inflammation: 0.45,
    proteobacteria: 0.4,
    akkermansia: 0.15,
    bifido: 0.4,
    faecalibacterium: 0.4,
    methane: 0.35,
    amrLoad: 0.25,
    fiber: 0.35,
    fat: 0.75,
  },
  "post-antibiotic": {
    diversity: 0.32,
    inflammation: 0.7,
    proteobacteria: 0.65,
    akkermansia: 0.25,
    bifido: 0.12,
    faecalibacterium: 0.2,
    methane: 0.1,
    amrLoad: 0.7,
    fiber: 0.4,
    fat: 0.45,
  },
};

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitter(id: string, key: string, magnitude = 0.08) {
  const n = hash(`${id}:${key}`);
  return 1 + ((n % 1000) / 1000 - 0.5) * 2 * magnitude;
}

function speciesAbundance(sample: SampleInput, def: (typeof SPECIES)[number], w: Weights) {
  const mid = (def.ref[0] + def.ref[1]) / 2 || 0.01;
  let factor = 1;
  const t = def.taxon;

  if (t === "Faecalibacterium prausnitzii") factor = 0.25 + w.faecalibacterium * 1.6;
  else if (t.startsWith("Akkermansia")) factor = 0.15 + w.akkermansia * 1.7;
  else if (t.startsWith("Bifidobacterium")) factor = 0.15 + w.bifido * 1.6;
  else if (t.startsWith("Roseburia") || t.startsWith("Eubacterium") || t.startsWith("Anaerobutyricum") || t.startsWith("Coprococcus"))
    factor = 0.25 + w.fiber * 1.4 * (1 - w.inflammation * 0.4);
  else if (t.startsWith("Christensenella")) factor = 0.2 + w.diversity * 1.1;
  else if (t.startsWith("Lacticaseibacillus") || t.startsWith("Lactiplantibacillus"))
    factor = 0.3 + w.fiber * 0.8;
  else if (t === "Escherichia coli") factor = 0.2 + w.proteobacteria * 3.8;
  else if (t === "Klebsiella pneumoniae") factor = w.amrLoad * w.proteobacteria * 6;
  else if (t === "Enterobacter cloacae") factor = w.proteobacteria * 2.2;
  else if (t === "Enterococcus faecium") factor = 0.1 + w.amrLoad * 4.5;
  else if (t === "Enterococcus faecalis") factor = 0.3 + (1 - w.diversity) * 2;
  else if (t === "Clostridioides difficile") factor = w.amrLoad * (1 - w.diversity) * 3.5;
  else if (t === "Salmonella enterica") factor = sample.profileId === "dysbiosis-amr" ? 0.4 : 0.02;
  else if (t === "Campylobacter jejuni") factor = sample.profileId === "dysbiosis-amr" ? 0.15 : 0.02;
  else if (t === "Shigella sonnei") factor = 0.02;
  else if (t === "Pseudomonas aeruginosa") factor = w.proteobacteria * 0.8;
  else if (t === "Acinetobacter baumannii") factor = w.amrLoad > 0.8 ? 0.4 : 0.05;
  else if (t === "Staphylococcus aureus") factor = w.amrLoad * 1.1;
  else if (t === "Helicobacter pylori") factor = sample.indication.toLowerCase().includes("dyspepsia") ? 2 : 0.2;
  else if (t === "Fusobacterium nucleatum") factor = 0.2 + w.inflammation * 2.4;
  else if (t === "Streptococcus gallolyticus") factor = 0.2 + w.inflammation * 0.8;
  else if (t === "Bilophila wadsworthia" || t === "Desulfovibrio piger") factor = 0.3 + w.fat * 2.2;
  else if (t === "Ruminococcus gnavus" || t === "Ruminococcus torques") factor = 0.3 + w.inflammation * 2.6;
  else if (t === "Methanobrevibacter smithii") factor = 0.2 + w.methane * 3;
  else if (t === "Oxalobacter formigenes") factor = w.diversity * (sample.recentAntibiotics ? 0.15 : 1);
  else if (t === "Prevotella copri") factor = 0.4 + w.fiber * 1.8 * (1 - w.fat);
  else if (t.startsWith("Bacteroides") || t.startsWith("Phocaeicola"))
    factor = 0.7 + (1 - w.fiber) * 0.6;
  else if (def.role === "beneficial") factor = 0.4 + w.diversity * 0.9;
  else if (def.role === "pathogen") factor = w.proteobacteria * 0.6;

  const raw = mid * factor * jitter(sample.id, t);
  if (def.role === "pathogen" && raw < 0.002 && factor < 0.3) return 0;
  return Math.round(raw * 10000) / 10000;
}

function hitFromSpecies(def: (typeof SPECIES)[number], abundance: number): OrganismHit {
  return {
    taxon: def.taxon,
    rank: "species",
    relativeAbundance: abundance,
    referenceRange: def.ref,
    role: def.role,
    notes: def.notes,
    phylum: def.phylum,
    family: def.family,
  };
}

function amrFor(sample: SampleInput, w: Weights, species: OrganismHit[]): AmrFinding[] {
  const byTaxon = Object.fromEntries(species.map((s) => [s.taxon, s.relativeAbundance]));
  const findings: AmrFinding[] = [];
  for (const def of AMR_PANEL) {
    const hostLoad = def.organisms.reduce((acc, o) => acc + (byTaxon[o] ?? 0), 0);
    const present =
      w.amrLoad > 0.15 &&
      (hostLoad > 0.01 || (w.amrLoad > 0.6 && def.whoPriority !== "medium"));
    if (!present && w.amrLoad < 0.2) continue;
    if (!present && def.whoPriority === "medium" && w.amrLoad < 0.5) continue;
    if (!present && sample.source !== "biom" && sample.profileId === "healthy" && def.whoPriority === "critical") continue;

    const intensity = clamp(w.amrLoad * (0.4 + hostLoad * 8) * jitter(sample.id, def.gene, 0.2), 0, 1);
    if (intensity < 0.08) continue;
    if (sample.source !== "biom" && sample.profileId === "healthy" && intensity < 0.35 && def.whoPriority !== "medium") continue;

    const reads = Math.round(40 + intensity * 4000 * (1 + hostLoad));
    const coverage = Math.round((62 + intensity * 38) * 10) / 10;
    let level: AlertLevel = "info";
    if (def.whoPriority === "critical" && intensity > 0.35) level = "critical";
    else if (def.whoPriority === "critical" || (def.whoPriority === "high" && intensity > 0.5))
      level = "high";
    else if (intensity > 0.25) level = "moderate";
    else level = "low";

    const organism =
      def.organisms.find((o) => (byTaxon[o] ?? 0) > 0.01) ?? def.organisms[0];

    findings.push({
      organism,
      gene: def.gene,
      class: def.class,
      whoPriority: def.whoPriority,
      reads,
      coverage,
      interpretation: def.interpretation,
      clinicalNote: def.clinicalNote,
      level,
    });
  }

  const priorityRank = (p?: string) => {
    switch (p?.toLowerCase()) {
      case "critical":
        return 0;
      case "high":
        return 1;
      case "medium":
        return 2;
      default:
        return 3;
    }
  };

  findings.sort((a, b) => {
    const pA = priorityRank(a.whoPriority || a.level);
    const pB = priorityRank(b.whoPriority || b.level);
    if (pA !== pB) return pA - pB;
    return a.gene.localeCompare(b.gene);
  });

  return findings;
}

function diseaseScores(w: Weights, species: OrganismHit[], amr: AmrFinding[]): DiseaseScore[] {
  const get = (name: string) => species.find((s) => s.taxon === name)?.relativeAbundance ?? 0;
  const fp = get("Faecalibacterium prausnitzii");
  const akk = get("Akkermansia muciniphila");
  const ecoli = get("Escherichia coli");
  const fn = get("Fusobacterium nucleatum");
  const cdiff = get("Clostridioides difficile");
  const gnavus = get("Ruminococcus gnavus");
  const methan = get("Methanobrevibacter smithii");

  const raw: Record<string, number> = {
    ibd: clamp(w.inflammation * 70 + gnavus * 8 + ecoli * 6 - fp * 4),
    ibs: clamp(40 + Math.abs(w.methane - 0.4) * 40 + (1 - w.diversity) * 25),
    metabolic: clamp((1 - akk) * 25 + (1 - w.diversity) * 35 + w.fat * 30),
    nafld: clamp(w.fat * 40 + w.proteobacteria * 30 + (1 - akk) * 20),
    obesity: clamp((1 - w.diversity) * 30 + w.fat * 35 + (1 - get("Christensenella minuta") * 40)),
    atopy: clamp((1 - w.bifido) * 55 + (1 - w.diversity) * 20),
    sibo: clamp(methan * 25 + w.methane * 40),
    cdiff: clamp(cdiff * 200 + w.amrLoad * 20),
    abx: clamp(w.amrLoad * 50 + (1 - w.diversity) * 40 + (amr.length > 8 ? 15 : 0)),
    autoimmune: clamp(w.inflammation * 30 + get("Prevotella copri") * 2),
    parkinson: clamp((1 - get("Prevotella copri") / 8) * 20 + (1 - w.fiber) * 20),
  };

  return DISEASES.map((d) => {
    const score = Math.round((raw[d.id] ?? 20) * 10) / 10;
    const band: DiseaseScore["band"] =
      score > 70 ? "elevated" : score > 40 ? "borderline" : "typical";
    const drivers: string[] = [];
    if (d.id === "ibd") drivers.push("Low F. prausnitzii", "Enterobacteriaceae expansion", "R. gnavus");
    if (d.id === "metabolic") drivers.push("Low Akkermansia", "Reduced diversity", "Western-diet bile taxa");
    if (d.id === "abx") drivers.push("Resistome density", "Low diversity");
    if (d.id === "cdiff") drivers.push("C. difficile DNA", "Recent antibiotic ecology");
    if (d.id === "ibs") drivers.push("Methane archaea", "Evenness");
    if (!drivers.length) drivers.push("Community-wide pattern");
    return {
      id: d.id,
      name: d.name,
      category: d.category,
      score,
      band,
      drivers,
      evidence: d.evidence,
      clinicianNote: d.clinicianNote,
      patientNote: d.patientNote,
    };
  }).sort((a, b) => b.score - a.score);
}

function dietPlan(w: Weights, diseases: DiseaseScore[]): DietItem[] {
  const items: DietItem[] = [
    {
      food: "Eat a wide variety of plant foods (vegetables, fruits, whole grains, legumes, nuts, and seeds)",
      action: "emphasize",
      rationale:
        "Eating 30+ different plant types each week is the single strongest dietary driver of a rich, diverse gut microbiome (American Gut Project / mSystems 2018).",
      targets: ["Microbial Diversity", "Bacterial Richness"],
    },
    {
      food: "Increase dietary fibre steadily towards the recommended target (~30g daily)",
      action: "emphasize",
      rationale:
        "Fibre is the primary fuel for beneficial bacteria. Fermenting fibre produces protective Short-Chain Fatty Acids (SCFAs like butyrate) that feed colon cells and strengthen the gut barrier (The Lancet 2019; Cell 2016).",
      targets: ["Faecalibacterium prausnitzii", "Roseburia intestinalis"],
    },
    {
      food: "Incorporate naturally fermented foods containing live active cultures",
      action: w.bifido < 0.4 ? "emphasize" : "include",
      rationale:
        "Regular intake of live fermented cultures delivers friendly transient microbes, measurably expands microbiome diversity, and lowers inflammatory markers (Stanford trial / Cell 2021).",
      targets: ["Lactobacillus", "Bifidobacterium"],
    },
    {
      food: "Include whole foods rich in natural prebiotic fibres (inulin, resistant starch, pectin)",
      action: "include",
      rationale:
        "Prebiotic fibres selectively nourish friendly bacteria like Bifidobacterium, helping them thrive and naturally crowd out harmful bacteria.",
      targets: ["Bifidobacterium longum", "Akkermansia muciniphila"],
    },
    {
      food: "Choose colourful, polyphenol-rich plant foods and antioxidant sources",
      action: "emphasize",
      rationale:
        "Dietary polyphenols protect the gut barrier and support sentinel species like Akkermansia that maintain the protective mucus lining.",
      targets: ["Akkermansia muciniphila"],
    },
    {
      food: "Reduce ultra-processed convenience foods, refined sugars, and artificial sweeteners",
      action: "limit",
      rationale:
        "Harmful pathobionts thrive on easily accessible simple sugars and refined additives. Eating whole foods starves undesirable bacteria of easy fuel.",
      targets: ["Escherichia coli", "Harmful bacteria"],
    },
    {
      food: "Moderate heavily processed meats, trans-fats, and excessive saturated fats",
      action: w.fat > 0.6 ? "limit" : "include",
      rationale:
        "Diets heavy in processed meats and oxidized fats encourage bile-tolerant microbes that can irritate the gut lining and elevate inflammatory metabolites.",
      targets: ["Bilophila wadsworthia"],
    },
  ];

  const ibd = diseases.find((d) => d.id === "ibd");
  const ibs = diseases.find((d) => d.id === "ibs");
  const cdiff = diseases.find((d) => d.id === "cdiff");

  if (ibs && ibs.score >= 45) {
    items.push({
      food: "During active bloating or digestive sensitivity flares, favor gentle cooked/steamed whole foods over raw, coarse fibres",
      action: "avoid-if-symptomatic",
      rationale:
        "Temporarily opting for easily digestible cooked vegetables and soft grains helps soothe digestive comfort before gradually broadening fibre diversity.",
      targets: ["Digestive Comfort", "IBS sensitivity"],
    });
  }
  if (ibd && ibd.score >= 55) {
    items.push({
      food: "During active digestive inflammation episodes, prioritize soft, easily digestible soothing meals over high-insoluble roughage",
      action: "avoid-if-symptomatic",
      rationale:
        "Minimizes mucosal friction during active bowel inflammation. Reintroduce broader prebiotic plant diversity once symptoms stabilize.",
      targets: ["Gut Barrier Calm", "Mucosal Protection"],
    });
  }
  if (cdiff && cdiff.score >= 50) {
    items.push({
      food: "Do not self-start anti-diarrhoeals if fever or blood is present — seek medical evaluation immediately",
      action: "avoid-if-symptomatic",
      rationale:
        "C. difficile DNA plus symptoms needs a clinical toxin pathway, not a probiotic-only plan.",
      targets: ["Clostridioides difficile"],
    });
  }
  return items;
}

function aggregate(species: OrganismHit[], rank: "phylum" | "family"): OrganismHit[] {
  const sums = new Map<string, { abundance: number; phylum: string; family: string }>();
  for (const s of species) {
    const taxon = rank === "phylum" ? s.phylum : s.family;
    if (!taxon) continue;
    const prev = sums.get(taxon);
    const next = (prev?.abundance ?? 0) + s.relativeAbundance;
    sums.set(taxon, {
      abundance: next,
      phylum: rank === "phylum" ? taxon : s.phylum,
      family: rank === "family" ? taxon : s.family,
    });
  }
  return [...sums.entries()]
    .map(([taxon, v]) => ({
      taxon,
      rank,
      relativeAbundance: Math.round(v.abundance * 1000) / 1000,
      referenceRange: [0, 100] as [number, number],
      role: "commensal" as const,
      notes: "",
      phylum: v.phylum,
      family: v.family,
    }))
    .sort((a, b) => b.relativeAbundance - a.relativeAbundance);
}

function unit(n: number) {
  return Math.min(1, Math.max(0, n));
}

function abundanceOf(species: OrganismHit[], token: string) {
  const t = token.toLowerCase();
  return species
    .filter(
      (s) =>
        s.taxon.toLowerCase() === t ||
        s.taxon.toLowerCase().startsWith(t) ||
        s.taxon.toLowerCase().includes(` ${t}`),
    )
    .reduce((a, s) => a + s.relativeAbundance, 0);
}

function shannonFrom(species: OrganismHit[]) {
  let h = 0;
  for (const s of species) {
    const p = s.relativeAbundance / 100;
    if (p > 0) h -= p * Math.log(p);
  }
  return h;
}

/**
 * Gut Microbiome Health Index (GMHI)
 * Native implementation of Gupta et al. (Nature Communications, 2020)
 * and the QIIME 2 plugin `q2-health-index` (bioinf-mcb/q2-health-index).
 *
 * Formula:
 *   psi_MH = (R_MH / 7) * H_MH
 *   psi_MN = (R_MN / 31) * H_MN
 *   GMHI = log10((psi_MH + 1e-5) / (psi_MN + 1e-5))
 * where:
 *   R_MH, R_MN = non-zero richness of 7 health-prevalent and 43 health-scarce species
 *   H_MH, H_MN = Shannon diversity within each indicator subgroup
 */
export function calculateGmhi(species: OrganismHit[]): GmhiScore {
  const norm = (s: string) =>
    s
      .replace(/^s__/, "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const healthySet = new Set(GMHI_HEALTHY_SPECIES.map(norm));
  const nonHealthySet = new Set(GMHI_NON_HEALTHY_SPECIES.map(norm));

  const totalAbundance = species.reduce((acc, s) => acc + s.relativeAbundance, 0) || 100;

  // Proportions mapped by normalized species name
  const mhProportions = new Map<string, number>();
  const mnProportions = new Map<string, number>();

  for (const s of species) {
    const key = norm(s.taxon);
    const rawVal = s.relativeAbundance;
    const prop = rawVal > 0 ? (rawVal <= 1 && totalAbundance <= 1.05 ? rawVal : rawVal / 100) : 0;

    // Minimum relative abundance threshold 0.00001 (1e-5) as in q2-health-index rel_thresh
    if (prop >= 0.00001) {
      if (healthySet.has(key)) {
        mhProportions.set(key, (mhProportions.get(key) || 0) + prop);
      }
      if (nonHealthySet.has(key)) {
        mnProportions.set(key, (mnProportions.get(key) || 0) + prop);
      }
    }
  }

  // Shannon alpha diversity: - sum(p * ln(p))
  let mhShannon = 0;
  for (const p of mhProportions.values()) {
    if (p > 0) mhShannon -= p * Math.log(p);
  }

  let mnShannon = 0;
  for (const p of mnProportions.values()) {
    if (p > 0) mnShannon -= p * Math.log(p);
  }

  const rMh = mhProportions.size;
  const rMn = mnProportions.size;

  // Constants from Gupta et al. (2020) and q2-health-index default:
  const mhPrime = 7;
  const mnPrime = 31;
  const logThresh = 0.00001;

  const psiMh = (rMh / mhPrime) * mhShannon;
  const psiMn = (rMn / mnPrime) * mnShannon;

  const rawScore = Math.log10((psiMh + logThresh) / (psiMn + logThresh));
  const score = Math.round(rawScore * 100) / 100;

  const status: GmhiScore["status"] =
    score > 0 ? "healthy-like" : score < 0 ? "non-healthy-like" : "neutral";

  return {
    score,
    status,
    psiHealthy: Math.round(psiMh * 10000) / 10000,
    psiNonHealthy: Math.round(psiMn * 10000) / 10000,
    healthySpeciesFound: rMh,
    nonHealthySpeciesFound: rMn,
    reference: "Gupta et al. 2020 Nature Comm · q2-health-index",
  };
}

function weightsFromSpecies(species: OrganismHit[], sample: SampleInput): Weights {
  const fp = abundanceOf(species, "Faecalibacterium");
  const akk = abundanceOf(species, "Akkermansia");
  const bifido = abundanceOf(species, "Bifidobacterium");
  const proteo = species
    .filter((s) => /proteobacteria/i.test(s.phylum) || /enterobacter/i.test(s.family))
    .reduce((a, s) => a + s.relativeAbundance, 0);
  const pathogens = species.filter((s) => s.role === "pathogen").reduce((a, s) => a + s.relativeAbundance, 0);
  const methane = abundanceOf(species, "Methanobrevibacter");
  const bile = abundanceOf(species, "Bilophila") + abundanceOf(species, "Desulfovibrio");
  const rose = abundanceOf(species, "Roseburia") + abundanceOf(species, "Eubacterium rectale");
  const H = shannonFrom(species);
  const w: Weights = {
    diversity: unit((H - 1.2) / 2.6),
    inflammation: unit(
      (abundanceOf(species, "Ruminococcus gnavus") + proteo * 0.35 + pathogens * 0.5) / 12,
    ),
    proteobacteria: unit(proteo / 15),
    akkermansia: unit(akk / 3),
    bifido: unit(bifido / 6),
    faecalibacterium: unit(fp / 8),
    methane: unit(methane / 2),
    amrLoad: unit(pathogens / 2 + proteo / 20),
    fiber: unit((fp + rose + bifido) / 18),
    fat: unit(bile / 3 + (1 - unit((fp + akk) / 10)) * 0.3),
  };
  if (sample.recentAntibiotics) {
    w.diversity *= 0.85;
    w.amrLoad = Math.min(1, w.amrLoad + 0.12);
  }
  return w;
}

const ALIASES: Record<string, string> = {
  "bacteroides vulgatus": "Phocaeicola vulgatus",
  "clostridium difficile": "Clostridioides difficile",
  "escherichia coli": "Escherichia coli",
};

function roleForTaxon(
  taxon: string,
): OrganismHit["role"] {
  const def = SPECIES.find((s) => s.taxon.toLowerCase() === taxon.toLowerCase());
  if (def) return def.role;
  if (/klebsiella|salmonella|shigella|campylobacter|pseudomonas|acinetobacter|helicobacter|difficile|aureus|faecium/i.test(taxon)) {
    return "pathogen";
  }
  if (/escherichia|enterococcus|fusobacterium|bilophila|desulfovibrio|gnavus/i.test(taxon)) {
    return "opportunistic";
  }
  if (/faecalibacterium|akkermansia|bifidobacterium|roseburia|lactobacill|christensenella|oxalobacter/i.test(taxon)) {
    return "beneficial";
  }
  return "commensal";
}

function speciesFromBiom(biom: BiomColumnData): OrganismHit[] {
  const merged = new Map<string, OrganismHit>();
  for (const ob of biom.observations) {
    let taxon = ob.taxon.replace(/_/g, " ").trim();
    taxon = ALIASES[taxon.toLowerCase()] ?? taxon;
    const def = SPECIES.find((s) => s.taxon.toLowerCase() === taxon.toLowerCase());
    const key = def?.taxon ?? taxon;
    const prev = merged.get(key);
    const abundance = (prev?.relativeAbundance ?? 0) + ob.relativeAbundance;
    merged.set(key, {
      taxon: key,
      rank: key.endsWith("spp.") ? "genus" : "species",
      relativeAbundance: abundance,
      referenceRange: def?.ref ?? [0, 5],
      role: def?.role ?? roleForTaxon(key),
      notes: def?.notes ?? `Observed in uploaded BIOM table (${ob.id}).`,
      phylum: def?.phylum ?? ob.phylum,
      family: def?.family ?? ob.family,
    });
  }
  for (const def of SPECIES) {
    if (!merged.has(def.taxon)) {
      merged.set(def.taxon, hitFromSpecies(def, 0));
    }
  }
  return [...merged.values()];
}

function amrFromBiomFeatures(biom: BiomColumnData, existing: AmrFinding[]): AmrFinding[] {
  const extra: AmrFinding[] = [];
  for (const ob of biom.observations) {
    const def = AMR_PANEL.find(
      (g) =>
        ob.id.toLowerCase().includes(g.gene.toLowerCase()) ||
        ob.taxon.toLowerCase().includes(g.gene.toLowerCase()),
    );
    if (!def || existing.some((e) => e.gene === def.gene)) continue;
    extra.push({
      organism: ob.taxon,
      gene: def.gene,
      class: def.class,
      whoPriority: def.whoPriority,
      reads: Math.round(ob.count),
      coverage: Math.min(99, 50 + ob.relativeAbundance * 4),
      interpretation: def.interpretation,
      clinicalNote: def.clinicalNote,
      level: def.whoPriority === "critical" ? "critical" : def.whoPriority === "high" ? "high" : "moderate",
    });
  }
  return extra;
}

export function analyzeSample(sample: SampleInput, biom?: BiomColumnData): Analysis {
  const w = biom
    ? weightsFromSpecies(speciesFromBiom(biom), sample)
    : { ...PROFILE_WEIGHTS[sample.profileId === "biom-upload" ? "healthy" : sample.profileId] };
  if (!biom && sample.recentAntibiotics) {
    w.diversity *= 0.75;
    w.amrLoad = Math.min(1, w.amrLoad + 0.15);
    w.bifido *= 0.7;
  }

  let species = biom
    ? speciesFromBiom(biom)
    : SPECIES.map((def) => hitFromSpecies(def, speciesAbundance(sample, def, w)));
  if (!biom) {
    const speciesSum = species.reduce((a, s) => a + s.relativeAbundance, 0) || 1;
    species = species.map((s) => ({
      ...s,
      relativeAbundance: Math.round((s.relativeAbundance / speciesSum) * 10000) / 100,
    }));
  } else {
    species = species.map((s) => ({
      ...s,
      relativeAbundance: Math.round(s.relativeAbundance * 10000) / 10000,
    }));
    Object.assign(w, weightsFromSpecies(species, sample));
  }

  const phyla = aggregate(species, "phylum");
  const families = aggregate(species, "family");
  const beneficial = species.filter((s) => s.role === "beneficial").sort((a, b) => b.relativeAbundance - a.relativeAbundance);
  const pathogens = species
    .filter((s) => s.role === "pathogen" || (s.role === "opportunistic" && s.relativeAbundance > s.referenceRange[1]))
    .sort((a, b) => b.relativeAbundance - a.relativeAbundance);

  let amr = amrFor(sample, w, species);
  if (biom) amr = [...amr, ...amrFromBiomFeatures(biom, amr)];
  const diseases = diseaseScores(w, species, amr);
  const diet = dietPlan(w, diseases);

  const firm = phyla.find((p) => p.taxon === "Firmicutes")?.relativeAbundance ?? 40;
  const bact = phyla.find((p) => p.taxon === "Bacteroidota")?.relativeAbundance ?? 20;
  const shannon = Math.round((biom ? shannonFrom(species.filter((s) => s.relativeAbundance > 0)) : 2.1 + w.diversity * 2.4) * 100) / 100;
  const gmhi = calculateGmhi(species);
  const gutScore = Math.round(
    clamp(w.diversity * 40 + (1 - w.inflammation) * 25 + (1 - w.amrLoad) * 20 + w.fiber * 15),
  );

  const pathways = PATHWAYS.map((p) => {
    let idx = p.expected * (0.5 + w.fiber * 0.7);
    if (p.name.includes("Butyrate")) idx = 0.25 + w.faecalibacterium * 1.1;
    if (p.name.includes("sulphide")) idx = 0.2 + w.fat * 1.1;
    if (p.name.includes("colibactin")) idx = w.proteobacteria * 0.9;
    if (p.name.includes("Trimethylamine")) idx = 0.15 + w.fat * 1;
    if (p.name.includes("Mucin")) idx = 0.4 + w.akkermansia * 0.8;
    idx *= jitter(sample.id, p.name, 0.12);
    return {
      name: p.name,
      abundanceIndex: Math.round(idx * 100) / 100,
      expected: p.expected,
      interpretation:
        idx + 0.15 < p.expected
          ? "Below typical healthy-adult functional potential."
          : idx > p.expected * 1.4
            ? "Above typical; interpret with taxon context."
            : "Within a typical functional window.",
    };
  });

  const criticalAmr = amr.filter((a) => a.level === "critical" || a.level === "high");
  const doctorSummary = criticalAmr.length
    ? `Resistome includes ${criticalAmr.length} priority AMR gene(s) (top: ${criticalAmr[0].gene} in ${criticalAmr[0].organism}). Shannon diversity is ${shannon}. Gut Integrity Score is ${gutScore}/100. This represents peaceful gut colonization, not an active infection.`
    : `No critical-priority antibiotic resistance genes detected above reporting threshold. Shannon diversity is ${shannon}. Gut Integrity Score is ${gutScore}/100. Correlate alongside clinical examination.`;

  const patientSummary = `Your MYGUTBIOME Gut Score is ${gutScore} out of 100. Your gut bacterial diversity is ${
    w.diversity > 0.7 ? "thriving and well-balanced" : w.diversity > 0.45 ? "moderate (with great room for growth)" : "lower than average, meaning your gut garden needs nurturing"
  }. ${
    beneficial[0]
      ? `Your strongest protective helper bacteria in this sample is ${beneficial[0].taxon}.`
      : ""
  } ${
    criticalAmr.length
      ? "A few antibiotic resistance markers were found — this is peaceful gut colonization and is simply helpful information for your doctor if you ever need antibiotics."
      : "No critical hospital superbug resistance genes were detected in your sample."
  }`;

  const scientific = `${biom ? `BIOM table ${biom.fileName} (sample ${biom.sampleId}, ${biom.observations.length} features, ${Math.round(biom.totalCount).toLocaleString()} counts).` : "Shotgun classification"} identified ${species.filter((s) => s.relativeAbundance > 0.01).length} active bacterial taxa. Firmicutes to Bacteroidota ratio is ${
    Math.round((firm / (bact || 1)) * 100) / 100
  }. AMR panel evaluated ${amr.length} resistance determinants. Ecological pattern modules with elevated scores: ${diseases
    .filter((d) => d.band === "elevated")
    .map((d) => d.name)
    .join("; ") || "none"}.`;

  return {
    sample,
    generatedAt: new Date().toISOString(),
    lab: LAB,
    qc: {
      totalReads: biom ? Math.round(biom.totalCount) : 28_400_000 + (hash(sample.id) % 4_000_000),
      hostReadsPct: biom ? 0 : Math.round((4 + (1 - w.diversity) * 3) * 10) / 10,
      microbialReads: biom ? Math.round(biom.assignedCount || biom.totalCount) : 24_100_000,
      meanQuality: biom ? 0 : 36.2,
      duplicationPct: biom ? 0 : 8.4,
      classifiedPct: biom
        ? Math.round(((biom.assignedCount || biom.totalCount) / (biom.totalCount || 1)) * 1000) / 10
        : 92.1,
      contaminationFlag: false,
      kit: biom ? `Uploaded ${biom.fileName}` : "ONEOMICS Stool DNA Stabilize v3",
      pipeline: biom ? `MYGUTBIOME-BIOM · ${biom.format}` : "MYGUTBIOME-WGS 2.4.1",
    },
    diversity: {
      shannon,
      shannonRef: [3.2, 4.6],
      simpson: Math.round((0.85 + w.diversity * 0.12) * 1000) / 1000,
      chao1: Math.round(180 + w.diversity * 220),
      observedAsvs: biom ? biom.observations.length : Math.round(140 + w.diversity * 190),
      pielouEvenness: Math.round((0.55 + w.diversity * 0.3) * 100) / 100,
      firmicutesBacteroidota: Math.round((firm / (bact || 1)) * 100) / 100,
    },
    phyla,
    families,
    species: species.sort((a, b) => b.relativeAbundance - a.relativeAbundance),
    beneficial,
    pathogens,
    amr,
    diseases,
    pathways,
    scfa: [
      {
        name: "Butyrate Potential (Gut Barrier Fuel)",
        index: Math.round((0.2 + w.faecalibacterium * 0.8) * 100),
        note: "The primary fuel feeding your gut lining cells; calms inflammation and strengthens the gut wall.",
      },
      {
        name: "Propionate Potential (Metabolism Signal)",
        index: Math.round((0.35 + w.fiber * 0.5) * 100),
        note: "Natural metabolic signal that travels to your liver to help balance blood sugar and support fullness.",
      },
      {
        name: "Acetate Potential (Prebiotic Partner)",
        index: Math.round((0.5 + w.bifido * 0.4) * 100),
        note: "The most abundant friendly acid in your colon; feeds and cross-nourishes other beneficial microbes.",
      },
    ],
    diet,
    summary: {
      doctor: doctorSummary,
      patient: patientSummary,
      scientific,
    },
    actions: {
      doctor: [
        criticalAmr.length
          ? "Review AMR carriage before empiric antibiotics; obtain culture/AST for any active infection."
          : "No stewardship-critical resistome alerts.",
        diseases.find((d) => d.id === "ibd" && d.band !== "typical")
          ? "If GI symptoms persist, correlate with faecal calprotectin rather than treating the microbiome pattern alone."
          : "No IBD-pattern alert requiring urgent workup from this sample alone.",
        pathogens.some((p) => p.taxon === "Clostridioides difficile" && p.relativeAbundance > 0.02)
          ? "If patient has active watery diarrhea, order C. difficile toxin testing. Do not treat silent colonization."
          : "C. difficile DNA not detected at concerning levels.",
        "Document that MYGUTBIOME is an interpretive community report, not a stand-alone infectious disease diagnosis.",
        "Consider dietetic referral for a 6-week fiber and fermented-food plan if metabolic or diversity scores are low.",
      ],
      patient: [
        "Eat a Wide Variety of Plants: Aim to include 30 or more distinct plant types across each week (spanning vegetables, fruits, whole grains, beans, nuts, and seeds) to maximize microbial diversity (American Gut Project).",
        "Target ~30g Fibre Daily: Increase whole-food dietary fibre gradually with adequate water to fuel short-chain fatty acid (SCFA) production (The Lancet 2019; Cell 2016).",
        "Include Live Fermented Foods: Enjoy daily servings of live-culture fermented foods to nurture your microbiome with beneficial active cultures and support immune calm (Stanford trial / Cell 2021).",
        "Feed Friendly Microbes with Prebiotics: Focus meals around wholesome, minimally processed foods containing natural prebiotic fibres that selectively nourish friendly bacteria.",
        "Support Gut-Brain Balance with Movement & Sleep: Aim for regular daily physical activity (e.g. brisk walking) and protect 7–8 hours of consistent, restorative sleep.",
        "Responsible Healthcare Guidance: Never take unprescribed antibiotics; if prescribed a course by your GP, complete it as directed and rebuild diversity with varied plant fibres afterwards.",
      ],
    },
    gmhi,
    gutScore,
  };
}
