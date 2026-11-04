import type { Analysis, DiseaseScore } from "@/lib/microbiome/types";
import type { ReportRecord } from "@/lib/store";
import { Donut, PhylumBars } from "./charts";
import { LevelPill, MiniBar, ReportPage } from "./report-page";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Microscope,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
  Sparkles,
  BookOpen,
  Info,
} from "lucide-react";

/**
 * Clean Visual Disease Horizon Risk Graph:
 * Uncluttered horizontal risk gauge with 3-tier zones:
 * - Typical (0–40): Healthy baseline
 * - Borderline (41–70): Slightly off
 * - Elevated (71–100): Needs attention
 */
/** Helper to map disease module ID to its parent Disease Risk Model Domain */
function getDiseaseRiskDomain(id: string): string {
  if (["ibd", "ibs", "sibo", "cdiff"].includes(id)) return "GI & Mucosal Barrier";
  if (["metabolic", "nafld", "obesity"].includes(id)) return "Cardiometabolic";
  if (["abx"].includes(id)) return "Gut Recovery";
  return "Neuro-Immune & Allergy";
}

const DISEASE_COHORT_REFS: Record<string, { citation: string; keyTaxa: string }> = {
  ibd: {
    citation: "IBDMDB (Nature 2019) · MetaHIT (Nature 2014)",
    keyTaxa: "Faecalibacterium ↓, R. gnavus ↑, Enterobacteriaceae ↑",
  },
  cdiff: {
    citation: "Buffie et al. (Nature 2015) · CDC BPPL",
    keyTaxa: "Secondary bile converters ↓, Clostridia cluster XIVa ↓",
  },
  abx: {
    citation: "Palleja et al. (Nat Microbiol 2018)",
    keyTaxa: "Bifidobacteria ↓, resistome expansion, diversity contraction",
  },
  nafld: {
    citation: "Loomba et al. (Cell Metab 2017) · Aron-Wisnewsky (2020)",
    keyTaxa: "Proteobacteria ↑, secondary bile acid dysregulation",
  },
  ibs: {
    citation: "Tap et al. (Gastroenterology 2017) · Rome IV",
    keyTaxa: "Methanobrevibacter smithii ↑, fermentative dysbiosis",
  },
  metabolic: {
    citation: "Qin et al. (Nature 2012) · Karlsson et al. (2013)",
    keyTaxa: "Akkermansia muciniphila ↓, butyrate synthesizers ↓",
  },
  atopy: {
    citation: "Arrieta et al. (Sci Transl Med 2015)",
    keyTaxa: "Early-life commensals ↓ (Veillonella, Faecalibacterium)",
  },
  obesity: {
    citation: "Le Chatelier et al. (Nature 2013) · Turnbaugh (2009)",
    keyTaxa: "Metagenomic gene richness contraction, Firmicutes shift",
  },
  sibo: {
    citation: "Rezaie et al. (Am J Gastroenterol 2017)",
    keyTaxa: "Rapid fermenters ↑, Methanobacteriaceae ↑",
  },
  autoimmune: {
    citation: "Kostic et al. (Cell Host Microbe 2015)",
    keyTaxa: "Mucosal barrier disruption, pathobiont translocation",
  },
  parkinson: {
    citation: "Scheperjans et al. (Mov Disord 2015) · Sampson (2016)",
    keyTaxa: "Prevotellaceae ↓, Enterobacteriaceae ↑, slow transit pattern",
  },
};

function DiseaseHorizonGraph({ disease }: { disease: DiseaseScore }) {
  const { score, band, name, category, clinicianNote, drivers } = disease;
  const pinPct = Math.min(96, Math.max(4, score));
  const domain = getDiseaseRiskDomain(disease.id);
  const cohort = DISEASE_COHORT_REFS[disease.id] || {
    citation: "MetaHIT / HMP Cohort Reference",
    keyTaxa: drivers?.join(" · ") || "Sentinel microbial taxa",
  };

  const isElevated = score > 70;
  const isBorderline = !isElevated && score > 40;

  const statusConfig = isElevated
    ? {
        label: "High",
        badge: "bg-rose-50/80 text-rose-600 border-rose-200/80 font-semibold",
        indicatorBg: "bg-rose-500",
        scoreText: "text-rose-600",
      }
    : isBorderline
    ? {
        label: "Borderline",
        badge: "bg-amber-50/80 text-amber-700 border-amber-200/80 font-semibold",
        indicatorBg: "bg-amber-500",
        scoreText: "text-amber-700",
      }
    : {
        label: "Normal",
        badge: "bg-emerald-50/80 text-emerald-600 border-emerald-200/80 font-semibold",
        indicatorBg: "bg-emerald-500",
        scoreText: "text-emerald-600",
      };

  return (
    <div className="rounded-xl border border-[#1f4f4a]/15 bg-white p-1.5 px-2 shadow-2xs hover:border-[#1f4f4a]/30 transition-all flex flex-col justify-between">
      {/* Top Header: Domain, Category, Status Badge & Score */}
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1f4f4a] bg-[#1f4f4a]/8 px-1.5 py-0.5 rounded shrink-0">
              {domain}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b3c] truncate">
              {category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide border ${statusConfig.badge}`}>
              {statusConfig.label}
            </span>
            <span className={`font-mono text-[12px] font-bold tabular-nums ${statusConfig.scoreText}`}>
              {score}<span className="text-[10px] font-normal text-[#6a7875]">/100</span>
            </span>
          </div>
        </div>

        {/* Disease Model Name */}
        <h4 className="mt-0.5 text-[11.5px] font-bold text-[#143834] leading-tight">
          {name}
        </h4>
      </div>

      {/* Clean, Simple Multi-Zone Range Meter - Color Zones with Needle Indicator */}
      <div className="my-1.5">
        {/* Track with 3 Soft Pastel Reference Zones: Normal (0–40), Borderline (40–70), High (70–100) */}
        <div className="relative h-2.5 w-full rounded-full bg-slate-100 flex gap-[2px] p-[1px] border border-black/5">
          {/* Zone 1: Normal (0–40%) */}
          <div
            className="h-full bg-emerald-200/80 border-r border-emerald-300/50 rounded-l-full"
            style={{ width: "40%" }}
            title="Normal (0–40): Baseline"
          />

          {/* Zone 2: Borderline (40–70%) */}
          <div
            className="h-full bg-amber-200/80 border-r border-amber-300/50"
            style={{ width: "30%" }}
            title="Borderline (41–70): Slightly Off"
          />

          {/* Zone 3: High (70–100%) */}
          <div
            className="h-full bg-rose-200/80 rounded-r-full"
            style={{ width: "30%" }}
            title="High (71–100): Needs Attention"
          />

          {/* Precision Clinical Indicator Needle Pin */}
          <div
            className="absolute -top-1 -bottom-1 flex flex-col items-center pointer-events-none z-10"
            style={{ left: `${pinPct}%`, transform: "translateX(-50%)" }}
          >
            {/* Top Indicator Diamond / Pip */}
            <div
              className={`h-2.5 w-2.5 rotate-45 ${statusConfig.indicatorBg} border-[1.5px] border-white shadow-xs`}
            />
            {/* Vertical Line through track */}
            <div className={`w-[2px] flex-1 ${statusConfig.indicatorBg} shadow-2xs rounded-full mt-[-1px]`} />
          </div>
        </div>
      </div>

      {/* Complete, Clean Inside Card Reference & Clinical Details */}
      <div className="rounded-lg border border-[#1f4f4a]/10 bg-[#faf8f2] p-1 px-1.5 text-[10px] leading-snug space-y-0.5">
        {/* 1. Key Microbial Drivers (Upfront biological insight) */}
        <div className="flex items-start gap-1">
          <span className="font-bold text-[#143834] shrink-0">Key Drivers:</span>
          <span className="text-[#3d4c49] font-medium truncate">
            {drivers && drivers.length > 0 ? drivers.join(" · ") : cohort.keyTaxa}
          </span>
        </div>

        {/* 2. Clinical Directive (Clear actionable next step) */}
        {clinicianNote && (
          <div className="text-[#4d5c59]">
            <span className="font-bold text-[#143834]">Clinical Directive:</span> {clinicianNote}
          </div>
        )}

        {/* 3. Cohort Reference Citation (Quiet reference metadata) */}
        <div className="border-t border-[#1f4f4a]/8 pt-0.5 text-[9.5px] text-[#7a8885]">
          <strong className="text-[#143834]">Cohort Ref:</strong> {cohort.citation}
        </div>
      </div>
    </div>
  );
}

function getDoctorAmrGuidance(a: { gene: string; whoPriority: string; level: string }): string {
  const p = a.whoPriority?.toLowerCase() || a.level?.toLowerCase();
  const g = a.gene;
  if (p === "critical") {
    if (g.startsWith("blaCTX")) return "ESBL carriage. Avoid cephalosporins; obtain phenotypic AST prior to therapy.";
    if (g.startsWith("bla")) return "WHO Critical carbapenemase. Hospital contact precautions; verify AST.";
    if (g.startsWith("mcr")) return "Plasmid-mediated colistin resistance. Avoid empiric polymyxins; verify AST.";
    return "WHO Critical reserve marker. Avoid empiric therapy; verify in vitro AST.";
  }
  if (p === "high") {
    if (g.includes("van")) return "Vancomycin-resistant enterococci (VRE) marker. Verify AST before glycopeptides.";
    if (g.includes("mecA")) return "Methicillin resistance (MRSA) marker. Verify susceptibility before beta-lactams.";
    if (g.includes("gyrA") || g.includes("qnr")) return "Fluoroquinolone resistance determinant. Check antibiogram before ciprofloxacin.";
    if (g.includes("aac")) return "Aminoglycoside/quinolone modifying enzyme. Use alternative classes if treating.";
    if (g.includes("cfiA")) return "Bacteroides carbapenemase determinant. Tailor anaerobic antimicrobial selection.";
    return "High-priority resistance determinant. Confirm phenotypic AST prior to targeted therapy.";
  }
  return "Commensal carriage determinant. Silent colonization; verify in vitro AST if treating.";
}

export function DoctorReport({
  analysis,
  reportRecord,
}: {
  analysis: Analysis;
  reportRecord?: ReportRecord;
}) {
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

  const amrAll = [...analysis.amr].sort((a, b) => {
    const pA = priorityRank(a.whoPriority || a.level);
    const pB = priorityRank(b.whoPriority || b.level);
    if (pA !== pB) return pA - pB;
    return a.gene.localeCompare(b.gene);
  });
  const pathTop = analysis.pathogens.slice(0, 5);
  const benTop = analysis.beneficial.slice(0, 5);
  const allDiseases = analysis.diseases;

  // Clinical triage determination
  const hasCriticalAmr = amrAll.some((a) => a.level === "critical" || a.whoPriority === "critical");
  const hasHighAmr = amrAll.some((a) => a.level === "high" || a.whoPriority === "high");

  // Filter Active vs Baseline disease modules for Page 2
  const activeDiseases = allDiseases.filter((d) => d.score > 40);
  const typicalDiseases = allDiseases.filter((d) => d.score <= 40);

  // Group the active modules by Disease Risk Model Category
  const activeRiskCategories = [
    {
      name: "GI & Mucosal Barrier",
      modules: activeDiseases.filter((d) => ["ibd", "ibs", "sibo", "cdiff"].includes(d.id)),
    },
    {
      name: "Cardiometabolic",
      modules: activeDiseases.filter((d) => ["metabolic", "nafld", "obesity"].includes(d.id)),
    },
    {
      name: "Gut Recovery",
      modules: activeDiseases.filter((d) => ["abx"].includes(d.id)),
    },
    {
      name: "Neuro-Immune & Allergy",
      modules: activeDiseases.filter((d) => ["autoimmune", "atopy", "parkinson"].includes(d.id)),
    },
  ];



  // Compile specific patient clinical issues for quick doctor review
  type PatientIssue = {
    severity: "critical" | "warning" | "caution";
    title: string;
    finding: string;
    impact: string;
  };

  const patientIssues: PatientIssue[] = [];

  // 1. AMR carriage issues
  amrAll.forEach((a) => {
    if (a.whoPriority === "critical" || a.level === "critical") {
      patientIssues.push({
        severity: "critical",
        title: `WHO Critical AMR: ${a.gene} (${a.class})`,
        finding: `Detected in ${a.organism}.`,
        impact: "Carbapenem/colistin resistance marker; obtain AST before antimicrobial selection.",
      });
    } else if (a.whoPriority === "high" || a.level === "high") {
      patientIssues.push({
        severity: "warning",
        title: `High-Priority AMR: ${a.gene} (${a.class})`,
        finding: `Detected in ${a.organism}.`,
        impact: "Resistance to standard fluoroquinolones or glycopeptides; check antibiogram.",
      });
    }
  });

  // 2. Elevated disease patterns
  allDiseases
    .filter((d) => d.score > 70)
    .forEach((d) => {
      patientIssues.push({
        severity: "warning",
        title: `Elevated Pattern: ${d.name} (${d.score}/100)`,
        finding: d.drivers.length > 0 ? `Key drivers: ${d.drivers.join(", ")}` : "Metagenomic signature aligns with clinical cohort.",
        impact: d.clinicianNote || "Correlate with targeted biomarkers and patient symptom presentation.",
      });
    });

  // 3. Overgrown pathogens / opportunists
  analysis.pathogens
    .filter((p) => p.relativeAbundance > p.referenceRange[1])
    .slice(0, 2)
    .forEach((p) => {
      patientIssues.push({
        severity: p.role === "pathogen" ? "critical" : "warning",
        title: `Elevated Flora: ${p.taxon} (${p.relativeAbundance.toFixed(2)}%)`,
        finding: `Exceeds upper reference limit of ${p.referenceRange[1]}%.`,
        impact: "Can overgrow if gut balance is low; associated with intestinal mucosal irritation.",
      });
    });

  // 4. Depleted keystone beneficial flora
  analysis.beneficial
    .filter((b) => b.relativeAbundance < b.referenceRange[0])
    .slice(0, 2)
    .forEach((b) => {
      patientIssues.push({
        severity: "caution",
        title: `Depleted Keystone: ${b.taxon} (${b.relativeAbundance.toFixed(2)}%)`,
        finding: `Below protective threshold of ${b.referenceRange[0]}%.`,
        impact: b.taxon.includes("Faecalibacterium")
          ? "Reduced colonic butyrate synthesis; weakens epithelial barrier defense."
          : b.taxon.includes("Akkermansia")
          ? "Compromised mucosal lining renewal; increases metabolic endotoxemia risk."
          : "Reduced colonization resistance against opportunists.",
      });
    });

  // 5. Suppressed diversity
  if (analysis.diversity.shannon < 3.2) {
    patientIssues.push({
      severity: "caution",
      title: `Low Microbial Diversity (Shannon: ${analysis.diversity.shannon.toFixed(2)})`,
      finding: `Below healthy adult baseline (Ref: 3.2–4.6).`,
      impact: "Reduced ecological resilience; common after antibiotics or restricted diets.",
    });
  }

  // 6. GMHI Health Index Signal
  if (analysis.gmhi && analysis.gmhi.score < 0) {
    patientIssues.push({
      severity: "warning",
      title: `Dysbiotic Health Index (GMHI: ${analysis.gmhi.score > 0 ? "+" : ""}${analysis.gmhi.score.toFixed(2)})`,
      finding: `Below healthy-like threshold (> 0). Detected ${analysis.gmhi.healthySpeciesFound} health-prevalent vs ${analysis.gmhi.nonHealthySpeciesFound} health-scarce species.`,
      impact: "Collective ratio aligns with dysbiotic/disease cohorts (Gupta et al. Nature Comm 2020 / q2-health-index).",
    });
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* PAGE 1: CLINICAL METAGENOMIC SYNOPSIS & KEY FLORA SCREEN                  */}
      {/* ========================================================================= */}
      <ReportPage analysis={analysis} type="doctor" page={1} total={3}>
        {/* Urgent Clinical Alert Callout */}
        {hasCriticalAmr ? (
          <div className="mb-1.5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/70 p-1.5 text-rose-800 shadow-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="text-[10px] leading-snug">
              <span className="font-bold uppercase tracking-wider text-rose-700">
                Critical Clinical Triage Alert — WHO Priority Resistome Detected:
              </span>{" "}
              Isolates carry determinants conferring resistance to reserve antimicrobials (e.g. carbapenemases or ESBLs).
              Implement contact precautions if hospitalized. Confirm phenotypic susceptibility via culture AST prior to antibiotic therapy.
            </div>
          </div>
        ) : hasHighAmr ? (
          <div className="mb-1.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-1.5 text-amber-800 shadow-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <div className="text-[10px] leading-snug">
              <span className="font-bold uppercase tracking-wider text-amber-700">
                Antibiotic Safety Precaution:
              </span>{" "}
              High-priority AMR determinants detected (glycopeptide or quinolone resistance markers). Evaluate antimicrobial exposure history.
            </div>
          </div>
        ) : (
          <div className="mb-1.5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-1.5 text-emerald-800 shadow-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <div className="text-[10px] leading-snug">
              <span className="font-bold uppercase tracking-wider text-emerald-700">
                Resistome Screen Unremarkable:
              </span>{" "}
              No critical WHO-priority carbapenemase, colistin (mcr-1), or high-risk resistance determinants detected above reporting threshold.
            </div>
          </div>
        )}

        {/* 1. Clinical Synopsis & Gut Score / Community Integrity Gauge */}
        <div className="grid grid-cols-12 gap-2">
          {/* Left: Gut Score / Community Integrity Donut Gauge */}
          <div className="col-span-4 rounded-xl border border-[#1f4f4a]/15 bg-white/80 p-2 shadow-xs flex flex-col items-center justify-center text-center">
            <Donut value={analysis.gutScore} label="Gut Score" />
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border ${
                  analysis.gutScore >= 70
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : analysis.gutScore >= 40
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {analysis.gutScore >= 70
                  ? "Eubiotic (Ref ≥ 70)"
                  : analysis.gutScore >= 40
                  ? "Moderate Dysbiosis (40–69)"
                  : "Marked Dysbiosis (< 40)"}
              </span>
            </div>
            {/* Reference context for Gut Score */}
            <p className="mt-1 text-[9.5px] text-[#5c6b68] leading-tight">
              <strong>Gut Score Reference (0–100):</strong> Ref &ge; 70 Eubiotic &middot; 40–69 Moderate Dysbiosis &middot; &lt;40 Marked Dysbiosis. Multi-domain index: Diversity (40%), Low Inflammation (25%), Resistome (20%), SCFA Flora (15%). Calibrated to NIH HMP &amp; MetaHIT cohorts (Adult 18–65y baseline).
            </p>
          </div>

          {/* Right: Clinical Metagenomic Synopsis Details */}
          <div className="col-span-8 flex flex-col justify-between rounded-xl border border-[#1f4f4a]/15 bg-white/80 p-2 shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                  Clinical Metagenomic Synopsis
                </p>
                <span className="text-[9.5px] text-[#6a7875] font-mono">
                  ACCESSION: {analysis.sample.accession}
                </span>
              </div>
              <p className="mt-1 text-[10.5px] leading-snug text-[#143834]">
                {analysis.summary.doctor}
              </p>
            </div>

            {/* Metagenomic Key Metrics Table (Including Gut Score, GMHI & References) */}
            <div className="mt-1 border-t border-[#1f4f4a]/10 pt-1">
              <div className="grid grid-cols-3 gap-1.5 text-[9.5px]">
                {/* Metric 1: Gut Score & Reference */}
                <div className="rounded bg-[#faf8f2] border border-[#1f4f4a]/10 p-1">
                  <span className="text-[#5c6b68] block text-[9px] uppercase font-bold">Gut Score</span>
                  <span className={`font-bold text-[12px] ${analysis.gutScore < 40 ? "text-rose-600" : analysis.gutScore < 70 ? "text-amber-700" : "text-emerald-600"}`}>
                    {analysis.gutScore}
                    <span className="font-normal text-[9.5px] text-[#6a7875]">/100</span>{" "}
                    <span className="font-normal text-[9px] text-[#6a7875]">(&ge; 70)</span>
                  </span>
                  <span className="block text-[9px] text-[#5c6b68] mt-0.5 leading-tight truncate">
                    {analysis.gutScore >= 70 ? "Eubiotic" : analysis.gutScore >= 40 ? "Moderate" : "Dysbiotic"}
                  </span>
                </div>

                {/* Metric 2: GMHI (QIIME 2 Health Index) */}
                <div className="rounded bg-[#faf8f2] border border-[#1f4f4a]/10 p-1">
                  <span className="text-[#5c6b68] block text-[9px] uppercase font-bold">GMHI Index</span>
                  <span className={`font-bold text-[12px] ${analysis.gmhi?.score > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {analysis.gmhi ? (analysis.gmhi.score > 0 ? `+${analysis.gmhi.score.toFixed(2)}` : analysis.gmhi.score.toFixed(2)) : "N/A"}{" "}
                    <span className="font-normal text-[9px] text-[#6a7875]">(&gt; 0)</span>
                  </span>
                  <span className="block text-[9px] text-[#5c6b68] mt-0.5 leading-tight truncate">
                    {analysis.gmhi?.score > 0 ? "Healthy-like" : "Non-healthy"}
                  </span>
                </div>

                {/* Metric 3: Shannon Diversity & Reference */}
                <div className="rounded bg-[#faf8f2] border border-[#1f4f4a]/10 p-1">
                  <span className="text-[#5c6b68] block text-[9px] uppercase font-bold">Shannon Div</span>
                  <span className={`font-bold text-[12px] ${analysis.diversity.shannon < 3.2 ? "text-amber-700" : "text-[#143834]"}`}>
                    {analysis.diversity.shannon.toFixed(2)}{" "}
                    <span className="font-normal text-[9px] text-[#6a7875]">(3.2–4.6)</span>
                  </span>
                  <span className="block text-[9px] text-[#5c6b68] mt-0.5 leading-tight truncate">NIH baseline</span>
                </div>
              </div>

              {/* Reference Footnote directly under this metrics table */}
              <div className="mt-1 flex items-center justify-between border-t border-[#1f4f4a]/8 pt-0.5 text-[9.5px] text-[#5c6b68] leading-tight">
                <span>
                  <strong className="text-[#143834]">Standards:</strong> Gut Score &ge; 70 &middot; GMHI &gt; 0 Healthy-like (QIIME 2 q2-health-index) &middot; Shannon 3.2–4.6.
                </span>
                <span className="text-[#7a8885] italic">Ref: NIH HMP &middot; MetaHIT &middot; QIIME 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Pathogens vs Keystone Beneficial Sentinels Tables */}
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {/* Table A: Harmful Organisms */}
          <div className="rounded-lg border border-[#1f4f4a]/15 bg-white/85 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/12 pb-1">
                <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-[#E5484D]">
                  Harmful
                </h2>
                <span className="text-[9px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                  Upper Limit Ref
                </span>
              </div>

              {/* Pathogen Rows */}
              <div className="mt-1 space-y-0.5">
                {pathTop.map((p) => {
                  const isOver = p.relativeAbundance > p.referenceRange[1];
                  const maxAbundance = Math.max(...pathTop.map((x) => x.relativeAbundance), 5) * 1.05;
                  return (
                    <div key={p.taxon} className="rounded border border-[#1f4f4a]/8 bg-white/70 p-1 text-[10px]">
                      <div className="flex justify-between items-baseline gap-1">
                        <div className="min-w-0">
                          <span className="font-sans not-italic font-semibold text-[#143834] truncate block text-[10.5px]">{p.taxon}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-mono tabular-nums font-bold text-[10.5px] ${isOver ? "text-[#E5484D]" : "text-[#143834]"}`}>
                            {p.relativeAbundance.toFixed(2)}%
                          </span>
                          <span className="text-[9.5px] text-[#7a8885]">
                            (max {p.referenceRange[1]}%)
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                              isOver ? "bg-[#FDECEC] text-[#E5484D] border border-[#E5484D]/30" : "bg-[#faf8f2] text-[#4d5c59] border border-[#1f4f4a]/10"
                            }`}
                          >
                            {isOver ? "High" : "Trace"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-0.5">
                        <MiniBar value={p.relativeAbundance} max={maxAbundance} variant={isOver ? "rose" : "emerald"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reference Footnote */}
            <div className="mt-1 rounded bg-[#faf8f2] border border-[#1f4f4a]/10 p-1 text-[9.5px] leading-tight text-[#5c6b68]">
              <strong className="text-[#143834]">Reference Baseline:</strong> Upper limits derived from NIH HMP healthy cohort (95th percentile). Trace colonization (&le; ref) is typical, normal baseline bacteria.
            </div>
          </div>

          {/* Table B: Beneficial Organisms */}
          <div className="rounded-lg border border-[#1f4f4a]/15 bg-white/85 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/12 pb-1">
                <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-600">
                  Beneficial
                </h2>
                <span className="text-[9px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                  Lower Limit Ref
                </span>
              </div>

              {/* Keystone Rows */}
              <div className="mt-1 space-y-0.5">
                {benTop.map((p) => {
                  const isDepleted = p.relativeAbundance < p.referenceRange[0];
                  return (
                    <div key={p.taxon} className="rounded border border-[#1f4f4a]/8 bg-white/70 p-1 text-[10px]">
                      <div className="flex justify-between items-baseline gap-1">
                        <div className="min-w-0">
                          <span className="font-sans not-italic font-semibold text-[#143834] truncate block text-[10.5px]">{p.taxon}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-mono tabular-nums font-bold text-[10.5px] ${isDepleted ? "text-amber-700" : "text-emerald-600"}`}>
                            {p.relativeAbundance.toFixed(2)}%
                          </span>
                          <span className="text-[9.5px] text-[#7a8885]">
                            (min {p.referenceRange[0]}%)
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                              isDepleted ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {isDepleted ? "Depleted" : "Optimal"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-0.5">
                        <MiniBar value={p.relativeAbundance} max={Math.max(p.referenceRange[1], 1)} variant={isDepleted ? "amber" : "emerald"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reference Footnote */}
            <div className="mt-1 rounded bg-[#faf8f2] border border-[#1f4f4a]/10 p-1 text-[9.5px] leading-tight text-[#5c6b68]">
              <strong className="text-[#143834]">Reference Baseline:</strong> Lower limits defined by NIH HMP &amp; MetaHIT cohorts (10th percentile). Keystone flora produce butyrate and sustain mucosal shield.
            </div>
          </div>
        </div>

        {/* 3. Dedicated Patient Clinical Issues & Imbalances Box */}
        <div className="mt-1.5 rounded-lg border border-[#1f4f4a]/20 bg-[#faf8f2] p-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/12 pb-0.5">
            <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
              Identified Patient Issues &amp; Clinical Findings ({patientIssues.length})
            </h3>
            <span className="text-[9.5px] font-semibold text-[#6a7875]">
              Patient-specific abnormality triage
            </span>
          </div>

          {patientIssues.length === 0 ? (
            <div className="mt-1 flex items-center gap-2 text-[10px] text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>No critical clinical imbalances, pathogen overgrowth, or priority AMR carriage identified in this specimen.</span>
            </div>
          ) : (
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {patientIssues.slice(0, 4).map((issue, idx) => {
                const badgeColor =
                  issue.severity === "critical"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : issue.severity === "warning"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-[#1f4f4a]/8 text-[#143834] border-[#1f4f4a]/15";

                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-[#1f4f4a]/10 bg-white/90 p-1.5 text-[10px] shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[#143834] truncate">{issue.title}</span>
                      <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase border ${badgeColor} shrink-0`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[9.5px] text-[#4d5c59]">{issue.finding}</p>
                    <p className="mt-0.5 text-[9.5px] font-medium text-[#2d4c46] leading-tight">
                      <strong>Impact:</strong> {issue.impact}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          {/* Reference explanation for patient triage */}
          <div className="mt-1 text-[9.5px] text-[#7a8885] border-t border-[#1f4f4a]/8 pt-0.5">
            <strong>Triage Criteria Ref:</strong> Stratified against WHO BPPL (2024), published clinical dysbiosis cohorts (IBDMDB/MetaHIT), and HMP healthy population percentiles.
          </div>
        </div>

        {/* 4. Prioritized Recommended Clinician Actions */}
        <div className="mt-1.5 rounded-lg border border-[#1f4f4a]/15 bg-white/85 p-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5">
            <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-[#1f4f4a]" />
              Prioritized Clinician Actions &amp; Management Directives
            </h2>
            <span className="text-[9.5px] font-semibold text-[#6a7875]">Clinical Guidance</span>
          </div>
          <ol className="mt-1 space-y-0.5 pl-1 text-[10px] leading-snug">
            {analysis.actions.doctor.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#1f4f4a]/10 text-[9px] font-bold text-[#143834] border border-[#1f4f4a]/20 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[#143834]">{a}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Page 1 Bottom Reference Standards Banner */}
        <div className="mt-1.5 rounded-lg border border-[#1f4f4a]/12 bg-[#f4f0e6]/60 px-2.5 py-0.5 text-[9.5px] text-[#5c6b68] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3 w-3 text-[#9a7b3c] shrink-0" />
            <span>
              <strong>Primary Reference Standards:</strong> NIH Human Microbiome Project (Nature 2012) · MetaHIT Consortium (Nature 2010) · WHO BPPL Catalog (2024) · NCBI RefSeq Rel. 222.
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#7a8885] shrink-0 ml-2">ISO 15189:2022 Calibrated</span>
        </div>
      </ReportPage>

      {/* ========================================================================= */}
      {/* PAGE 2: CLINICAL PHENOTYPE & DISEASE RISK GRAPHS                          */}
      {/* ========================================================================= */}
      <ReportPage analysis={analysis} type="doctor" page={2} total={3}>
        {/* Header with Title & 3-Tier Legend */}
        <div className="flex items-baseline justify-between border-b border-[#1f4f4a]/15 pb-1">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Clinical Metagenomic Phenotyping · {allDiseases.length} Cohort-Calibrated Modules
            </span>
            <h2 className="font-serif text-lg text-[#143834] leading-tight">
              Disease &amp; Disorder Pattern Analysis
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#5c6b68]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Normal (0–40): Baseline
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Borderline (41–70): Slightly Off
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> High (71–100): Needs Attention
            </span>
          </div>
        </div>

        {/* SECTION 1: Active Clinical Signals (Elevated & Borderline Modules) */}
        <div className="mt-1.5">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5">
            <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Active Clinical Pattern Signals ({activeDiseases.length} Modules Requiring Attention)
            </h3>
            <span className="text-[9.5px] text-[#6a7875]">Score &gt; 40 (Cohort-Calibrated)</span>
          </div>

          {/* Active Disease Risk Model Category Breakdown Chip Strip */}
          <div className="mt-1 flex items-center justify-between gap-1.5 rounded-lg border border-[#1f4f4a]/12 bg-white/90 px-2 py-0.5 text-[10px]">
            <span className="font-bold text-[#143834] uppercase tracking-wider text-[9.5px] shrink-0">
              Risk Domains ({activeDiseases.length} Active):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeRiskCategories.map((cat) => {
                const count = cat.modules.length;
                const hasElevated = cat.modules.some((m) => m.score > 70);
                return (
                  <span
                    key={cat.name}
                    className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] font-medium border border-[#1f4f4a]/15 text-[#143834]"
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`font-mono font-bold text-[9.5px] px-1 rounded ${
                        hasElevated
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : count > 0
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-[#1f4f4a]/8 text-[#143834]"
                      }`}
                    >
                      {count}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {activeDiseases.length === 0 ? (
            <div className="mt-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 p-2 text-center text-[10px] text-emerald-800">
              <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-emerald-600 mb-0.5" />
              All {allDiseases.length} clinical disease and disorder modules are within the <strong>Typical Healthy Baseline window (0–40)</strong>. No associative dysbiosis patterns detected.
            </div>
          ) : (
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {activeDiseases.map((d, idx) => {
                const isLastOdd = activeDiseases.length % 2 !== 0 && idx === activeDiseases.length - 1;
                return (
                  <div key={d.id} className={isLastOdd ? "col-span-2" : ""}>
                    <DiseaseHorizonGraph disease={d} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Complete Baseline Screen (Modules within Normal Window) */}
        <div className="mt-1.5">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5">
            <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Screening Modules Within Normal Baseline ({typicalDiseases.length} Modules)
            </h3>
            <span className="text-[9.5px] text-[#6a7875]">Score &le; 40 (Normal)</span>
          </div>

          <div className="mt-1 grid grid-cols-3 gap-1">
            {typicalDiseases.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-md border border-[#1f4f4a]/10 bg-white/70 px-1.5 py-0.5 text-[10px]"
              >
                <span className="text-[#143834] font-medium truncate">{d.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-mono text-[9.5px] text-[#6a7875]">{d.score}%</span>
                  <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 text-[9px] font-bold">
                    Normal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote / Clinical Methodology & Score Guide */}
        <div className="mt-1.5 rounded border border-[#1f4f4a]/15 bg-white/60 px-2 py-1 text-[9.5px] leading-tight text-[#5c6b68]">
          <p>
            <span className="font-semibold text-[#143834]">Cohort Reference Standards:</span> MetaHIT Consortium (Nature 2014, IBD &amp; metabolic), IBDMDB (Nature 2019, CD/UC), Zeller et al. (Mol Syst Biol 2014, colorectal), Qin et al. (Nature 2012, T2D), Buffie et al. (Nature 2015, C. difficile).
          </p>
          <p className="mt-0.5">
            <span className="font-semibold text-[#143834]">Interpretation Scale:</span> <strong>Normal (0–40):</strong> Normal baseline matching healthy controls. <strong>Borderline (41–70):</strong> Mild dysbiosis shift. <strong>High (71–100):</strong> Significant alignment with published disease cohorts (non-diagnostic; correlate with clinical biomarkers e.g. calprotectin, HbA1c, eGFR).
          </p>
        </div>
      </ReportPage>

      {/* ========================================================================= */}
      {/* PAGE 3: AMR RESISTOME TABLE, STEWARDSHIP & PHYSICIAN SIGN-OFF BLOCK       */}
      {/* ========================================================================= */}
      <ReportPage analysis={analysis} type="doctor" page={3} total={3} contentClassName="py-2.5">
        {/* AMR Resistome Section */}
        <div>
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/15 pb-1">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
              AMR Pathogens &amp; Resistance Determinants (CARD / NCBI Catalog)
            </h2>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Targeted Metagenomic Screen
            </span>
          </div>

          {/* Simple Priority Guide for Normal People & Clinicians */}
          <div className="mt-1 flex items-center justify-between gap-1 text-[9px] bg-[#faf8f2] border border-[#1f4f4a]/10 rounded-md px-2 py-0.5">
            <span className="font-bold text-[#143834] uppercase tracking-wider text-[9px] shrink-0">Severity Scale:</span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold px-1.5 py-0.2 text-[8.5px] uppercase">
                1. Critical
              </span>
              <span className="text-[#5c6b68]">Reserve drugs (Carbapenems, Colistin)</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold px-1.5 py-0.2 text-[8.5px] uppercase">
                2. High
              </span>
              <span className="text-[#5c6b68]">Specialist Rx (Vancomycin, Cipro)</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold px-1.5 py-0.2 text-[8.5px] uppercase">
                3. Medium
              </span>
              <span className="text-[#5c6b68]">Routine (Tetracyclines, Sulfa)</span>
            </div>
          </div>

          {amrAll.length === 0 ? (
            <div className="mt-2 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-900 shadow-2xs">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="text-[12px] font-bold text-emerald-800">
                  Resistome Surveillance Negative — No Priority Resistance Genes Detected
                </h3>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-emerald-700">
                  Comprehensive metagenomic screening against the CARD and NCBI pathogen catalogs confirmed the absence of high-priority carbapenemases (blaNDM, blaKPC, blaOXA-48), colistin resistance (mcr-1), or ESBL determinants in this sample.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-1 overflow-hidden rounded-xl border border-[#1f4f4a]/15 bg-white shadow-2xs">
              <table className="w-full text-left table-fixed">
                <thead className="bg-[#1f4f4a]/6 border-b border-[#1f4f4a]/12 text-[9.5px] font-bold uppercase tracking-wider text-[#143834]">
                  <tr>
                    <th className="py-0.5 px-2 w-[72px]">Priority</th>
                    <th className="py-0.5 px-2 w-[105px]">Gene Marker</th>
                    <th className="py-0.5 px-2 w-[150px]">Resistance Class</th>
                    <th className="py-0.5 px-2 w-[125px]">Host Organism</th>
                    <th className="py-0.5 px-2">Clinical Prescribing Guidance &amp; Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f4f4a]/8 text-[10px]">
                  {amrAll.map((a) => {
                    const isCrit = a.whoPriority === "critical" || a.level === "critical";
                    const isHigh = a.whoPriority === "high" || a.level === "high";

                    return (
                      <tr
                        key={a.gene}
                        className={
                          isCrit
                            ? "bg-rose-50/40"
                            : isHigh
                            ? "bg-amber-50/30"
                            : "bg-white"
                        }
                      >
                        <td className="py-0.5 px-2">
                          <span
                            className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold uppercase border ${
                              isCrit
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : isHigh
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            {a.whoPriority.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-0.5 px-2 font-mono font-bold text-[#143834] text-[11px] truncate">
                          {a.gene}
                        </td>
                        <td className="py-0.5 px-2 text-[#4d5c59] text-[10px] leading-tight truncate">
                          {a.class}
                        </td>
                        <td className="py-0.5 px-2 italic text-[#143834] text-[10px] leading-tight truncate">
                          {a.organism}
                        </td>
                        <td className="py-0.5 px-2 text-[#2d4c46] leading-tight text-[10px]">
                          {getDoctorAmrGuidance(a)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Reference standards note for AMR */}
          <div className="mt-1 rounded bg-[#faf8f2] border border-[#1f4f4a]/10 px-2 py-0.5 text-[9.5px] leading-tight text-[#5c6b68]">
            <p>
              <strong className="text-[#143834]">Reference Standards:</strong> CARD 3.2.9 &amp; WHO BPPL (2024 revision). <strong className="text-[#143834]">Prescribing Guidance:</strong> Silent colonization carriage is not an active infection. Confirm phenotypic AST prior to antimicrobial therapy.
            </p>
          </div>
        </div>

        {/* Treatment Guidance & Patient Follow-up Plan */}
        <div className="mt-1 rounded-lg border border-[#1f4f4a]/15 bg-white/80 p-1.5 shadow-xs">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-[#1f4f4a]" />
            Treatment Guidance &amp; Patient Follow-up Plan
          </h2>
          <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded border border-[#1f4f4a]/10 bg-white/60 p-1 px-1.5">
              <span className="font-semibold text-[#143834] block text-[10.5px]">Safe Antibiotic Prescribing</span>
              <p className="mt-0.5 text-[9.5px] leading-snug text-[#4d5c59]">
                If antimicrobials are clinically required, cross-reference resistome findings and order AST susceptibility tests. Avoid broad-spectrum empiric courses when targeted therapy is feasible.
              </p>
            </div>

            <div className="rounded border border-[#1f4f4a]/10 bg-white/60 p-1 px-1.5">
              <span className="font-semibold text-[#143834] block text-[10.5px]">When to Re-Test (8–12 Weeks)</span>
              <p className="mt-0.5 text-[9.5px] leading-snug text-[#4d5c59]">
                Repeat metagenomic profiling is recommended 8–12 weeks after completing targeted dietary interventions or antimicrobial therapy to evaluate microbiome recovery and stability.
              </p>
            </div>
          </div>
        </div>

        {/* Page 3 Bottom Specimen Metadata & Regulatory Notice Banner */}
        <div className="mt-1 rounded-lg border border-[#1f4f4a]/12 bg-[#f4f0e6]/60 px-2 py-0.5 text-[9px] leading-tight text-[#5c6b68] flex items-center justify-between">
          <p>
            <span className="font-semibold text-[#143834]">Regulatory Notice:</span> Stool metagenomic profiling provides clinical decision support. It does not replace tissue endoscopy, histopathology, calprotectin, or formal in vitro AST.
          </p>
          <span className="font-mono text-[8.5px] text-[#7a8885] shrink-0 ml-3">Delphina LIMS · ISO 15189:2022</span>
        </div>
      </ReportPage>
    </>
  );
}
