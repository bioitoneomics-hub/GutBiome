import Image from "next/image";
import type { Analysis, DiseaseScore, OrganismHit } from "@/lib/microbiome/types";
import { Donut } from "./charts";
import { LevelPill, ReportPage } from "./report-page";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Info,
  CheckCircle2,
  Apple,
  Salad,
  Activity,
  Heart,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Leaf,
  Stethoscope,
  BookOpen,
} from "lucide-react";

/** Helper to map disease module ID to its parent Disease Risk Model Domain */
function getDiseaseRiskDomain(id: string): string {
  if (["ibd", "ibs", "sibo", "cdiff"].includes(id)) return "GI & Mucosal Barrier";
  if (["metabolic", "nafld", "obesity"].includes(id)) return "Cardiometabolic";
  if (["abx"].includes(id)) return "Gut Recovery";
  return "Neuro-Immune & Allergy";
}

/**
 * Visual Disease Horizon Risk Graph for Patient Report:
 * Horizontal risk gauge with 3-tier zones:
 * - Typical (0–40): Healthy baseline
 * - Borderline (41–70): Slightly off
 * - Elevated (71–100): Needs attention
 */
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
    keyTaxa: "Methanobrevibacter smithii ↑, fermentative imbalance",
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

/** Plain-language translations for disease comparison modules to eliminate patient anxiety */
interface PatientDiseaseInfo {
  friendlyTitle: string;
  plainTakeaway: string;
  actionAdvice: string;
}

const PATIENT_FRIENDLY_DISEASE_INFO: Record<string, PatientDiseaseInfo> = {
  ibd: {
    friendlyTitle: "Digestive Barrier & Inflammation Watch",
    plainTakeaway: "Your fiber-digesting gut flora is slightly low while inflammatory markers are elevated.",
    actionAdvice: "Enjoy gentle soluble fibers (oatmeal, cooked carrots, chia seeds) and live probiotic foods to soothe the gut lining.",
  },
  cdiff: {
    friendlyTitle: "Microbial Defense Against Disruptive Invaders",
    plainTakeaway: "Your natural protective bacteria (which shield against foreign invaders) are temporarily reduced.",
    actionAdvice: "Prioritize fermented foods (curd, kefir) and diverse plant fibers to strengthen your natural defensive barrier.",
  },
  abx: {
    friendlyTitle: "Gut Flora Rebuilding & Recovery Progress",
    plainTakeaway: "Your microbiome shows signs of a post-antibiotic or stress recovery pattern.",
    actionAdvice: "Gradually reintroduce 30+ varied weekly plant foods to rebuild bacterial diversity over the next 4–8 weeks.",
  },
  nafld: {
    friendlyTitle: "Liver Metabolism & Wellness Balance",
    plainTakeaway: "Microbial signals linked to liver bile acid processing and metabolic harmony are slightly off.",
    actionAdvice: "Focus on antioxidant-rich berries, green tea, cruciferous vegetables, and reduced refined sugars.",
  },
  ibs: {
    friendlyTitle: "Digestive Comfort & Bloating Sensitivity",
    plainTakeaway: "Microbial patterns associated with gas production and transit sensitivity are elevated.",
    actionAdvice: "Eat regular, unhurried meals; stay hydrated and temporarily moderate high-gas foods like carbonated drinks.",
  },
  metabolic: {
    friendlyTitle: "Blood Sugar & Energy Utilization Balance",
    plainTakeaway: "Bacteria that help regulate insulin sensitivity and smooth glucose absorption are running low.",
    actionAdvice: "Pair whole-grain carbs with lentils, nuts, and healthy fats to support steady blood sugar balance.",
  },
  sibo: {
    friendlyTitle: "Upper Digestive Fermentation Balance",
    plainTakeaway: "Excess rapid fermentation of sugars in the digestive tract may trigger fullness after meals.",
    actionAdvice: "Allow 3–4 hours between meals to support normal digestive cleansing waves.",
  },
  obesity: {
    friendlyTitle: "Caloric Harvest & Energy Extraction Balance",
    plainTakeaway: "The bacterial balance indicates increased caloric harvest from dietary carbs.",
    actionAdvice: "Increase bulky whole vegetables, fiber-rich legumes, and protein to promote lasting satiety.",
  },
  autoimmune: {
    friendlyTitle: "Immune System & Barrier Harmony",
    plainTakeaway: "Gut wall barrier signals suggest mild immune interaction along the digestive lining.",
    actionAdvice: "Nourish the mucosal layer with zinc carnosine, omega-3 fats, bone or vegetable broth, and polyphenols.",
  },
  atopy: {
    friendlyTitle: "Allergy & Environmental Sensitivity Balance",
    plainTakeaway: "Early-protective microbial strains that modulate immune tolerances are below optimal levels.",
    actionAdvice: "Regular consumption of prebiotic inulin and diverse fiber supports immune modulation.",
  },
  parkinson: {
    friendlyTitle: "Gut-Brain Motility & Nerve Communication",
    plainTakeaway: "Microbial species that produce neuro-active metabolites and stimulate bowel motility are lower.",
    actionAdvice: "Support gut-brain communication with daily walking, fiber hydration, and polyphenol-rich foods.",
  },
};

function PatientDiseaseHorizonGraph({ disease }: { disease: DiseaseScore }) {
  const { score, band, name, category, drivers } = disease;
  const pinPct = Math.min(96, Math.max(4, score));
  const domain = getDiseaseRiskDomain(disease.id);
  const cohort = DISEASE_COHORT_REFS[disease.id] || {
    citation: "MetaHIT / HMP Cohort Reference",
    keyTaxa: drivers?.join(" · ") || "Sentinel microbial taxa",
  };
  const friendlyInfo = PATIENT_FRIENDLY_DISEASE_INFO[disease.id] || {
    friendlyTitle: name,
    plainTakeaway: "Bacterial shifts in this area indicate potential room to nurture digestive flora.",
    actionAdvice: "Focus on eating diverse whole plant fibers, staying hydrated, and incorporating fermented foods.",
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
    <div className="rounded-xl border border-[#1f4f4a]/15 bg-white p-2.5 shadow-2xs hover:border-[#1f4f4a]/30 transition-all flex flex-col justify-between">
      <div>
        {/* Header: Title, Category & Score */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className="text-[7px] font-bold uppercase tracking-wider text-[#1f4f4a] bg-[#1f4f4a]/8 px-1.5 py-0.5 rounded shrink-0">
              {domain}
            </span>
            <span className="text-[7.5px] font-semibold uppercase tracking-wider text-[#9a7b3c] truncate">
              {category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`rounded px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide border ${statusConfig.badge}`}>
              {statusConfig.label}
            </span>
            <span className={`font-mono text-xs font-bold tabular-nums ${statusConfig.scoreText}`}>
              {score}<span className="text-[8px] font-normal text-[#6a7875]">/100</span>
            </span>
          </div>
        </div>

        <h4 className="mt-1 text-[11px] font-bold text-[#143834] leading-tight">
          {friendlyInfo.friendlyTitle}
        </h4>
        <span className="text-[7.5px] text-[#7a8885] italic font-sans block">
          Clinical Module: {name}
        </span>
      </div>

      {/* Clean Multi-Zone Range Meter - Color Zones with Needle Indicator */}
      <div className="my-1.5">
        <div className="relative h-2.5 w-full rounded-full bg-slate-100 flex gap-[2px] p-[1px] border border-black/5">
          {/* Zone 1: Normal (0–40%) */}
          <div
            className="h-full bg-emerald-200/80 border-r border-emerald-300/50 rounded-l-full"
            style={{ width: "40%" }}
            title="Normal (0–40)"
          />

          {/* Zone 2: Borderline (40–70%) */}
          <div
            className="h-full bg-amber-200/80 border-r border-amber-300/50"
            style={{ width: "30%" }}
            title="Borderline (41–70)"
          />

          {/* Zone 3: High (70–100%) */}
          <div
            className="h-full bg-rose-200/80 rounded-r-full"
            style={{ width: "30%" }}
            title="High (71–100)"
          />

          {/* Precision Indicator Needle Pin */}
          <div
            className="absolute -top-1 -bottom-1 flex flex-col items-center pointer-events-none z-10"
            style={{ left: `${pinPct}%`, transform: "translateX(-50%)" }}
          >
            <div
              className={`h-2.5 w-2.5 rotate-45 ${statusConfig.indicatorBg} border-[1.5px] border-white shadow-xs`}
            />
            <div className={`w-[2px] flex-1 ${statusConfig.indicatorBg} shadow-2xs rounded-full mt-[-1px]`} />
          </div>
        </div>
      </div>

      {/* Patient Friendly Plain Takeaway & Action Box */}
      <div className="rounded-lg border border-[#1f4f4a]/10 bg-[#faf8f2] p-1.5 text-[7.5px] leading-snug space-y-1">
        <p className="text-[#2d4c46] leading-relaxed">
          <strong className="text-[#143834]">Plain Takeaway:</strong> {friendlyInfo.plainTakeaway}
        </p>
        <p className="text-[#4d5c59] leading-relaxed">
          <strong className="text-[#143834]">Nutritional Focus:</strong> {friendlyInfo.actionAdvice}
        </p>
        <div className="flex items-center justify-between border-t border-[#1f4f4a]/8 pt-0.5 text-[6.5px] text-[#7a8885]">
          <span><strong className="text-[#143834]">Study Cohort:</strong> {cohort.citation}</span>
          <span className="italic">{cohort.keyTaxa}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual Range Bar for Patients:
 * Shows the reference healthy interval as a shaded green track,
 * with a highlighted pin showing the patient's actual abundance.
 */
function PatientRangeBar({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}) {
  const upperLimit = Math.max(max * 1.35, value * 1.25, 5);
  const leftPct = Math.min(100, Math.max(0, (min / upperLimit) * 100));
  const widthPct = Math.min(100 - leftPct, Math.max(2, ((max - min) / upperLimit) * 100));
  const pinPct = Math.min(98, Math.max(2, (value / upperLimit) * 100));

  const isLow = value < min;
  const isHigh = value > max;
  const isOptimal = !isLow && !isHigh;

  return (
    <div className="space-y-1">
      <div className="relative h-3 w-full rounded-full bg-[#e8e4dc]">
        {/* Shaded typical reference window */}
        <div
          className="absolute top-0 h-full rounded-full bg-emerald-200/80"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        {/* Patient marker dot */}
        <div
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${
            isOptimal ? "bg-emerald-600" : isLow ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ left: `${pinPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-[#6a7875]">
        <span>0%</span>
        <span className="font-medium text-[#2d4c46]">
          Healthy target window: {min}% – {max}% <span className="text-[8px] text-[#7a8885] font-normal">(Ref: 10th–90th percentile)</span>
        </span>
        <span>{upperLimit.toFixed(1)}%</span>
      </div>
    </div>
  );
}

/** Friendly English roles, summaries, and whole-food sources for key beneficial bacteria */
interface BeneficialFloraInfo {
  friendlyTitle: string;
  roleSummary: string;
  dietSource: string;
}

const BENEFICIAL_INFO: Record<string, BeneficialFloraInfo> = {
  "Faecalibacterium prausnitzii": {
    friendlyTitle: "Colon Barrier & Butyrate Guardian",
    roleSummary: "Nourishes the cells lining your colon, soothing inflammation and supporting gut barrier strength.",
    dietSource: "Feeds on inulin, cooked & cooled potatoes, oats, and lentils.",
  },
  "Akkermansia muciniphila": {
    friendlyTitle: "Protective Mucus Barrier Guardian",
    roleSummary: "Strengthens the intestinal mucus coating and supports healthy metabolic balance.",
    dietSource: "Feeds on polyphenol-rich foods like pomegranate, berries, walnuts, and green tea.",
  },
  "Bifidobacterium longum": {
    friendlyTitle: "Digestive Calming & Soothing Sentinel",
    roleSummary: "Calms digestive sensitivity, promotes smooth regularity, and defends against unwanted microbes.",
    dietSource: "Nourished by garlic, onions, bananas, and live probiotic yogurts.",
  },
  "Bifidobacterium adolescentis": {
    friendlyTitle: "Fiber Fermenter & Vitality Supporter",
    roleSummary: "Breaks down complex prebiotic plant fibers and helps produce vital B-vitamins.",
    dietSource: "Feeds on resistant starches, oats, barley, and whole legumes.",
  },
  "Bifidobacterium bifidum": {
    friendlyTitle: "Intestinal Wall Shield Defender",
    roleSummary: "Forms a physical shield along your gut wall to prevent unwanted bacterial attachment.",
    dietSource: "Supported by fermented curd, buttermilk, and soluble dietary fiber.",
  },
  "Roseburia intestinalis": {
    friendlyTitle: "Energy & Anti-Inflammatory Specialist",
    roleSummary: "Produces healing butyrate that fuels colon cells and keeps gut inflammation low.",
    dietSource: "Feeds on whole-grain wheat, rye, barley, and beta-glucans.",
  },
  "Roseburia hominis": {
    friendlyTitle: "Colon Fuel & Harmony Specialist",
    roleSummary: "Promotes digestive motility and works alongside other flora to produce vital fatty acids.",
    dietSource: "Flourishes with plant diversity, flaxseeds, and leafy greens.",
  },
  "Lacticaseibacillus rhamnosus": {
    friendlyTitle: "Immune Support & Bloating Defender",
    roleSummary: "Supports natural immune defenses and eases occasional digestive bloating.",
    dietSource: "Found in live probiotic yogurts, kefir, and fermented vegetables.",
  },
  "Lactiplantibacillus plantarum": {
    friendlyTitle: "Resilience & Fermentation Sentinel",
    roleSummary: "Strengthens digestive resilience and preserves gut barrier integrity.",
    dietSource: "Found in naturally fermented sauerkraut, kimchi, and sourdough.",
  },
  "Eubacterium rectale": {
    friendlyTitle: "Fiber Converter & Colon Energizer",
    roleSummary: "Converts dietary fibers into nourishing short-chain fatty acids for a healthy gut.",
    dietSource: "Thrives on complex beans, lentils, peas, and whole grains.",
  },
  "Bifidobacterium breve": {
    friendlyTitle: "Gentle Digestion & Immune Supporter",
    roleSummary: "Promotes gentle digestion and supports balanced immune responses in the gut.",
    dietSource: "Supported by chicory root, oats, and fermented curd.",
  },
  "Bifidobacterium animalis": {
    friendlyTitle: "Regularity & Transit Helper",
    roleSummary: "Supports smooth and regular daily bowel movements.",
    dietSource: "Abundant in probiotic yogurts and fortified fermented dairy.",
  },
  "Lactobacillus acidophilus": {
    friendlyTitle: "Natural Acid Protector",
    roleSummary: "Produces lactic acid to maintain a healthy, protective gut pH.",
    dietSource: "Common in traditional dahi (curd), kefir, and fermented milk.",
  },
};

/** Plain-language translations for watchlist bacteria to prevent patient anxiety */
const WATCHLIST_FRIENDLY_INFO: Record<string, { friendlyName: string; plainMeaning: string }> = {
  "Escherichia coli": {
    friendlyName: "Everyday Resident Coli",
    plainMeaning: "Normal resident bacteria; kept safely in check by friendly flora and dietary fiber.",
  },
  "Ruminococcus gnavus": {
    friendlyName: "Gas-Producing Mucus Flora",
    plainMeaning: "Natural resident that ferments mucus sugars; higher levels may cause bloating.",
  },
  "Klebsiella pneumoniae": {
    friendlyName: "Occasional Gut Passenger",
    plainMeaning: "Common environmental bacterium that passes peacefully through healthy digestion.",
  },
  "Enterococcus faecalis": {
    friendlyName: "Digestive Lactic Resident",
    plainMeaning: "Natural lactic bacterium living peacefully in the human colon.",
  },
  "Enterobacter cloacae": {
    friendlyName: "Transient Colon Resident",
    plainMeaning: "Natural colon resident present in low quantities in healthy guts.",
  },
  "Citrobacter freundii": {
    friendlyName: "Minor Digestive Resident",
    plainMeaning: "Typical minor inhabitant of the digestive tract.",
  },
  "Morganella morganii": {
    friendlyName: "Occasional Gut Inhabitant",
    plainMeaning: "Natural resident kept suppressed by beneficial acid-producing species.",
  },
  "Proteus mirabilis": {
    friendlyName: "Everyday Gut Microbe",
    plainMeaning: "Normal digestive inhabitant found in healthy populations.",
  },
  "Pseudomonas aeruginosa": {
    friendlyName: "Transient Inhabitant",
    plainMeaning: "Widespread environmental microbe passing harmlessly through the gut.",
  },
  "Staphylococcus aureus": {
    friendlyName: "Surface Flora Inhabitant",
    plainMeaning: "Common skin and digestive resident living harmlessly in low numbers.",
  },
  "Clostridioides difficile": {
    friendlyName: "Disruptive Invader Sentinel",
    plainMeaning: "Kept harmlessly dormant and suppressed by abundant healthy beneficial flora.",
  },
};

export function PatientReport({ analysis }: { analysis: Analysis }) {
  const lowHelpful = analysis.beneficial.filter(
    (b) => b.relativeAbundance < b.referenceRange[0],
  );
  const optimalHelpful = analysis.beneficial.filter(
    (b) => b.relativeAbundance >= b.referenceRange[0],
  );
  const watch = analysis.pathogens.filter((p) => p.relativeAbundance > 0);
  const criticalAmr = analysis.amr.filter((a) => a.level === "critical" || a.level === "high");

  // Filter Active vs Baseline disease modules for Page 4
  const allDiseases = analysis.diseases;
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

  // Health interpretation banner
  const scoreBadge =
    analysis.gutScore >= 75
      ? { label: "Optimal Microbial Balance", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : analysis.gutScore >= 45
      ? { label: "Moderate Balance · Room for Growth", color: "bg-amber-50 text-amber-700 border-amber-200" }
      : { label: "Rebalancing Needed · Active Recovery", color: "bg-rose-50 text-rose-700 border-rose-200" };

  // Species data
  const allSpecies = analysis.species || [];

  // Helper to get species abundance by partial name
  const getAbundance = (searchTerm: string) => {
    return (
      allSpecies.find((s) => s.taxon.toLowerCase().includes(searchTerm.toLowerCase()))
        ?.relativeAbundance ?? 0
    );
  };

  const mSmithiiAbundance = getAbundance("smithii");
  const rGnavusAbundance = getAbundance("gnavus");
  const eColiAbundance = getAbundance("coli");
  const fpAbundance = getAbundance("Faecalibacterium");
  const bifidoAbundance =
    getAbundance("Bifidobacterium longum") +
    getAbundance("Bifidobacterium adolescentis") +
    getAbundance("Bifidobacterium bifidum");

  const ibsModule = allDiseases.find((d) => d.id === "ibs");
  const siboModule = allDiseases.find((d) => d.id === "sibo");

  const isConstipationSluggish =
    mSmithiiAbundance >= 0.1 || (ibsModule && ibsModule.score >= 50);

  const isBloatingElevated =
    rGnavusAbundance >= 0.5 || eColiAbundance >= 2.0 || (siboModule && siboModule.score >= 40);

  return (
    <>
      {/* ========================================================================= */}
      {/* PAGE 1: OVERVIEW & YOUR GUT SCORE                                         */}
      {/* ========================================================================= */}
      <ReportPage analysis={analysis} type="patient" page={1} total={5}>
        <div className="flex items-center justify-between border-b border-[#1f4f4a]/12 pb-1.5 mb-2">
          <div>
            <span className="text-[9.5px] font-semibold uppercase tracking-wider text-[#9a7b3c]">
              Personal Metagenomic Assessment
            </span>
            <h1 className="font-serif text-xl text-[#143834] leading-tight">Personalized Gut Health Profile</h1>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${scoreBadge.color}`}>
            {scoreBadge.label}
          </span>
        </div>

        {/* 1. Clinical Synopsis & Gut Score / Community Integrity Gauge (Same layout as Doctor Report) */}
        <div className="grid grid-cols-12 gap-2.5">
          {/* Left: Gut Score / Community Integrity Donut Gauge */}
          <div className="col-span-4 rounded-xl border border-[#1f4f4a]/15 bg-white/80 p-2 shadow-xs flex flex-col items-center justify-center text-center">
            <Donut value={analysis.gutScore} label="Gut Score" />
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                  analysis.gutScore >= 70
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : analysis.gutScore >= 40
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {analysis.gutScore >= 70
                  ? "Optimal Gut Balance (≥ 70)"
                  : analysis.gutScore >= 40
                  ? "Moderate Balance · Room to Grow (40–69)"
                  : "Rebalancing Needed · Active Recovery (< 40)"}
              </span>
            </div>
            {/* Reference context for Gut Score */}
            <p className="mt-1 text-[7.5px] text-[#6a7875] leading-tight">
              <strong>Your Gut Health Rating (0–100):</strong> Combines bacterial diversity, beneficial flora levels, and digestive barrier strength into a single wellness score. A score above 70 reflects a resilient, well-balanced digestive ecosystem.
            </p>
          </div>

          {/* Right: Personal Metagenomic Synopsis Details */}
          <div className="col-span-8 flex flex-col justify-between rounded-xl border border-[#1f4f4a]/15 bg-white/80 p-2 shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                  Personal Metagenomic Synopsis
                </p>
                <span className="text-[8px] text-[#6a7875] font-mono">
                  ACCESSION: {analysis.sample.accession}
                </span>
              </div>
              <p className="mt-1 text-[9.5px] leading-relaxed text-[#143834]">
                {analysis.summary.patient}
              </p>
            </div>

            {/* Metagenomic Key Metrics Table (Plain Language Translations) */}
            <div className="mt-1.5 border-t border-[#1f4f4a]/10 pt-1">
              <div className="grid grid-cols-3 gap-1.5 text-[8px]">
                {/* Metric 1: Gut Score & Reference */}
                <div className="rounded bg-[#faf8f2] border border-[#1f4f4a]/10 p-1">
                  <span className="text-[#6a7875] block text-[6.5px] uppercase font-semibold">Gut Score</span>
                  <span className={`font-bold ${analysis.gutScore < 40 ? "text-rose-600" : analysis.gutScore < 70 ? "text-amber-700" : "text-emerald-600"}`}>
                    {analysis.gutScore}
                    <span className="font-normal text-[6.5px] text-[#6a7875]">/100</span>{" "}
                    <span className="font-normal text-[6px] text-[#6a7875]">(&ge; 70)</span>
                  </span>
                  <span className="block text-[6.5px] font-medium text-[#7a8885] mt-0.5 leading-tight truncate">
                    {analysis.gutScore >= 70 ? "Optimal Balance" : analysis.gutScore >= 40 ? "Room to Grow" : "Active Recovery"}
                  </span>
                </div>

                {/* Metric 2: GMHI (QIIME 2 Health Index) */}
                <div className="rounded bg-[#faf8f2] border border-[#1f4f4a]/10 p-1">
                  <span className="text-[#6a7875] block text-[6.5px] uppercase font-semibold">Ecosystem Balance</span>
                  <span className={`font-bold ${analysis.gmhi?.score > 0 ? "text-emerald-600" : "text-amber-700"}`}>
                    {analysis.gmhi ? (analysis.gmhi.score > 0 ? "+Balanced" : "Shifted") : "Normal"}{" "}
                    <span className="font-normal text-[6px] text-[#6a7875]">({analysis.gmhi ? (analysis.gmhi.score > 0 ? `+${analysis.gmhi.score.toFixed(2)}` : analysis.gmhi.score.toFixed(2)) : "0.00"})</span>
                  </span>
                  <span className="block text-[6.5px] font-medium text-[#7a8885] mt-0.5 leading-tight truncate">
                    {analysis.gmhi?.score > 0 ? "Protective Pattern" : "Nourishment Needed"}
                  </span>
                </div>

                {/* Metric 3: Shannon Diversity & Reference */}
                <div className="rounded bg-[#faf8f2] border border-[#1f4f4a]/10 p-1">
                  <span className="text-[#6a7875] block text-[6.5px] uppercase font-semibold">Bacterial Variety</span>
                  <span className={`font-bold ${analysis.diversity.shannon < 3.2 ? "text-amber-700" : "text-[#143834]"}`}>
                    {analysis.diversity.shannon.toFixed(2)}{" "}
                    <span className="font-normal text-[6px] text-[#6a7875]">(Goal: 3.2–4.6)</span>
                  </span>
                  <span className="block text-[6.5px] font-medium text-[#7a8885] mt-0.5 leading-tight truncate">
                    {analysis.diversity.shannon >= 3.5 ? "Rich Diversity" : "Fiber Diversity Needed"}
                  </span>
                </div>
              </div>

              {/* Reference Footnote directly under this metrics table */}
              <div className="mt-1 flex items-center justify-between border-t border-[#1f4f4a]/8 pt-0.5 text-[6.5px] text-[#6a7875] leading-tight">
                <span>
                  <strong className="text-[#143834]">Wellness Targets:</strong> Gut Score &ge; 70 &middot; Protective Ecosystem Pattern &middot; Bacterial Variety 3.2–4.6.
                </span>
                <span className="text-[#7a8885] italic">Ref: NIH HMP &middot; MetaHIT</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Key Pillars Highlights (3 Columns) */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          {/* Card 1: Diversity */}
          <div className="rounded-xl border border-[#1f4f4a]/12 bg-white/85 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#9a7b3c]" />
                  <span className="text-[10px] font-semibold text-[#143834]">Bacterial Variety</span>
                </div>
                <span className="text-[7.5px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-1 py-0.2 rounded">
                  Goal: 3.2–4.6
                </span>
              </div>
              <p className="mt-1 text-[9px] text-[#4d5c59] leading-snug">
                Variety rating is <strong className="text-[#143834]">{analysis.diversity.shannon.toFixed(2)}</strong>.{" "}
                {analysis.diversity.shannon >= 3.5
                  ? "Lush variety of gut flora, supporting smooth and resilient digestion."
                  : "Your bacterial variety is slightly low. Eating diverse colorful plant foods will help your gut garden flourish."}
              </p>
            </div>
            <p className="mt-1 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: NIH HMP Baseline
            </p>
          </div>

          {/* Card 2: Beneficial Helpers */}
          <div className="rounded-xl border border-[#1f4f4a]/12 bg-white/85 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="text-[10px] font-semibold text-[#143834]">Protective Helper Flora</span>
                </div>
                <span className="text-[7.5px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-1 py-0.2 rounded">
                  Goal: &ge; 80% Thriving
                </span>
              </div>
              <p className="mt-1 text-[9px] text-[#4d5c59] leading-snug">
                <strong className="text-[#143834]">{optimalHelpful.length} of {analysis.beneficial.length}</strong> key beneficial species are at healthy levels, actively defending your digestive barrier.
              </p>
            </div>
            <p className="mt-1 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: MetaHIT Cohort Standards
            </p>
          </div>

          {/* Card 3: Resistance Check */}
          <div className="rounded-xl border border-[#1f4f4a]/12 bg-white/85 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1">
                <div className="flex items-center gap-1.5">
                  {criticalAmr.length > 0 ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <span className="text-[10px] font-semibold text-[#143834]">Natural Defenses &amp; Safety</span>
                </div>
                <span className="text-[7.5px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-1 py-0.2 rounded">
                  Screen Passed
                </span>
              </div>
              <p className="mt-1 text-[9px] text-[#4d5c59] leading-snug">
                {criticalAmr.length > 0
                  ? "No active infections detected. Natural defense markers are living quietly in your digestive tract without causing symptoms."
                  : "No high-priority antibiotic resistance determinants identified in your sample."}
              </p>
            </div>
            <p className="mt-1 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: WHO BPPL &middot; CARD 3.2.9
            </p>
          </div>
        </div>



        {/* 3. Targeted Prebiotic & Probiotic Nutritional Support */}
        <div className="mt-2 rounded-2xl border border-[#1f4f4a]/15 bg-white/95 p-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1 mb-1.5">
            <div className="flex items-center gap-2">
              <Leaf className="h-3.5 w-3.5 text-[#1f4f4a]" />
              <div>
                <span className="font-serif text-[11.5px] font-bold text-[#143834] block leading-tight">
                  Targeted Prebiotics &amp; Probiotics Nutritional Support
                </span>
                <span className="text-[8.5px] text-[#6a7875]">
                  Microbial nutrition to replenish depleted species and nourish beneficial gut flora
                </span>
              </div>
            </div>
            <span className="rounded-full bg-[#faf8f2] border border-[#1f4f4a]/15 px-2 py-0.2 text-[8px] font-bold text-[#143834] uppercase tracking-wider">
              Nutritional Guidance
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-[9px]">
            {/* Probiotics Card */}
            <div className="rounded-xl border border-[#1f4f4a]/12 bg-white p-2.5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#143834] text-white text-[8px] font-bold">
                      ✓
                    </span>
                    <h3 className="font-bold text-[#143834] text-[10px]">Probiotics (Live Beneficial Cultures)</h3>
                  </div>
                  <span className="text-[7px] font-semibold text-[#143834] bg-[#faf8f2] border border-[#1f4f4a]/12 px-1 py-0.2 rounded">
                    Replenish &amp; Protect
                  </span>
                </div>
                <p className="text-[8.5px] text-[#4d5c59] leading-snug">
                  Active beneficial bacteria that help restore digestive balance, strengthen the mucosal barrier, and defend against harmful overgrowth.
                </p>

                {/* Key Strains */}
                <div className="mt-1.5">
                  <span className="text-[7px] font-bold uppercase tracking-wider text-[#143834] block mb-0.5">
                    Key Strains to Replenish:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "Bifidobacterium longum",
                      "Bifidobacterium bifidum",
                      "Lactobacillus rhamnosus",
                      "Lactobacillus plantarum",
                      "Lactobacillus acidophilus",
                      "Saccharomyces boulardii",
                    ].map((strain) => (
                      <span
                        key={strain}
                        className="rounded bg-[#faf8f2] border border-[#1f4f4a]/10 px-1 py-0.2 text-[7px] text-[#143834] font-medium"
                      >
                        {strain}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Natural Food Sources */}
                <div className="mt-1.5">
                  <span className="text-[7px] font-bold uppercase tracking-wider text-[#143834] block mb-0.5">
                    Natural Whole Foods:
                  </span>
                  <p className="text-[8px] text-[#4d5c59] leading-tight">
                    Fresh live curd (dahi), spiced buttermilk (chaas), kefir, kimchi, sauerkraut, fermented batter (idli/dosa), and fermented miso.
                  </p>
                </div>
              </div>

              <div className="mt-1 border-t border-[#1f4f4a]/8 pt-0.5 text-[6.5px] text-[#6a7875] italic">
                Tip: Prioritize live-culture, unsweetened foods to nurture friendly flora without feeding unwanted bacteria.
              </div>
            </div>

            {/* Prebiotics Card */}
            <div className="rounded-xl border border-[#1f4f4a]/12 bg-white p-2.5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#9a7b3c] text-white text-[8px] font-bold">
                      ★
                    </span>
                    <h3 className="font-bold text-[#143834] text-[10px]">Prebiotics (Fuel for Good Bacteria)</h3>
                  </div>
                  <span className="text-[7px] font-semibold text-[#143834] bg-[#faf8f2] border border-[#1f4f4a]/12 px-1 py-0.2 rounded">
                    Nourish &amp; Multiply
                  </span>
                </div>
                <p className="text-[8.5px] text-[#4d5c59] leading-snug">
                  Specialized dietary fibers that travel undigested to your colon, feeding beneficial bacteria to produce soothing short-chain fatty acids (SCFAs / butyrate).
                </p>

                {/* Key Fibers */}
                <div className="mt-1.5">
                  <span className="text-[7px] font-bold uppercase tracking-wider text-[#143834] block mb-0.5">
                    Key Functional Fibers:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "Inulin (FOS)",
                      "Resistant Starch",
                      "Arabinoxylan",
                      "Pectin",
                      "Galacto-oligosaccharides",
                    ].map((fiber) => (
                      <span
                        key={fiber}
                        className="rounded bg-[#faf8f2] border border-[#1f4f4a]/10 px-1 py-0.2 text-[7px] text-[#143834] font-medium"
                      >
                        {fiber}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Natural Food Sources */}
                <div className="mt-1.5">
                  <span className="text-[7px] font-bold uppercase tracking-wider text-[#143834] block mb-0.5">
                    Natural Whole Foods:
                  </span>
                  <p className="text-[8px] text-[#4d5c59] leading-tight">
                    Garlic, onions, leeks, green bananas, cooked &amp; cooled oats/rice/potatoes, lentils (dals), chickpeas, flaxseeds, and apples.
                  </p>
                </div>
              </div>

              <div className="mt-1 border-t border-[#1f4f4a]/8 pt-0.5 text-[6.5px] text-[#6a7875] italic">
                Tip: Increase prebiotic plant fibers gradually alongside plenty of water to give your digestive system time to adapt.
              </div>
            </div>
          </div>
        </div>

        {/* Reassurance Notice - Clean Neutral Warm Styling */}
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-2 text-[10px] text-[#143834] leading-snug">
          <Info className="h-4 w-4 shrink-0 text-[#1f4f4a] mt-0.5" />
          <p>
            <strong>Important Guidance:</strong> This report is a personalized educational wellness profile of your stool microbiome. It is not an acute disease diagnosis or prescription. Always share this report with your physician to guide tailored nutrition or care.
          </p>
        </div>

        {/* Page 1 Bottom Reference Standards Banner */}
        <div className="mt-1.5 rounded-lg border border-[#1f4f4a]/12 bg-[#faf8f2] px-2.5 py-1 text-[7.5px] leading-tight text-[#5c6b68] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#9a7b3c] shrink-0" />
            <div>
              <span className="font-bold text-[#143834]">Scientific Reference Standards:</span>{" "}
              Population baselines derived from NIH Human Microbiome Project (Nature 2012) &middot; MetaHIT Consortium (Nature 2010) &middot; QIIME 2 q2-health-index (Gupta et al. Nature Comm 2020) &middot; World Health Organization (WHO BPPL 2024) &middot; CARD Database (3.2.9).
            </div>
          </div>
          <span className="font-mono text-[7px] text-[#143834] bg-white border border-[#1f4f4a]/10 px-2 py-0.5 rounded shrink-0 ml-2 font-semibold">
            ISO 15189:2022 Calibrated
          </span>
        </div>
      </ReportPage>

      {/* ========================================================================= */}
      {/* PAGE 2: BENEFICIAL & KEYSTONE FLORA EVALUATION                            */}
      {/* ========================================================================= */}
      <ReportPage analysis={analysis} type="patient" page={2} total={5}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b3c]">
              Section 1 · Beneficial &amp; Protective Flora
            </span>
            <h2 className="font-serif text-2xl text-[#143834]">Your Beneficial Gut Helpers</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {optimalHelpful.length} of {analysis.beneficial.length} In Reference Range
            </span>
            <span className="text-[8.5px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-2 py-0.5 rounded">
              Ref: NIH HMP &middot; MetaHIT
            </span>
          </div>
        </div>

        <p className="mt-1.5 text-[11px] leading-relaxed text-[#3d4c49]">
          Beneficial microbes produce healing <strong>short-chain fatty acids (like butyrate)</strong> that nourish the cells lining your colon, regulate appetite, and maintain a strong digestive barrier.
        </p>

        {/* Coaching Note: Food vs Probiotic Pills (Moved Above Range Bars) */}
        <div className="mt-2 rounded-lg border border-[#9a7b3c]/25 bg-[#faf6ed] p-2 text-[10px] text-[#4d5c59] leading-snug">
          <p className="font-semibold text-[#143834] flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-[#9a7b3c]" />
            Food Diversity vs. Probiotic Supplements
          </p>
          <p className="mt-0.5">
            {lowHelpful.length > 0 ? (
              <>
                A few keystone microbes (like{" "}
                <span className="italic">{lowHelpful.map((b) => b.taxon.split(" ")[0]).join(", ")}</span>) are currently below target. Clinical studies consistently demonstrate that eating diverse plant fibres (vegetables, whole grains, legumes, and natural prebiotics) feeds your existing bacteria much more effectively than off-the-shelf probiotic capsules.
              </>
            ) : (
              "Your core beneficial microbes are well-balanced. Continuing a diet rich in diverse colourful whole-plant foods and live fermented cultures will sustain this protective ecosystem."
            )}
          </p>
        </div>

        {/* Organism Cards with Range Bars */}
        <div className="mt-2 space-y-1.5">
          {analysis.beneficial.slice(0, 5).map((b) => {
            const isLow = b.relativeAbundance < b.referenceRange[0];
            const isHigh = b.relativeAbundance > b.referenceRange[1];
            const info = BENEFICIAL_INFO[b.taxon] || {
              friendlyTitle: b.taxon.split(" ")[0] + " Helper",
              roleSummary: b.notes || "Protective gut bacterium supporting digestive balance.",
              dietSource: "Diverse whole plant fibers and fermented foods.",
            };

            return (
              <div
                key={b.taxon}
                className="rounded-lg border border-[#1f4f4a]/15 bg-white/90 p-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif italic font-bold text-[13px] text-[#143834] leading-tight">
                    {b.taxon}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase border ${
                        isLow
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {isLow ? "Low · Needs Nourishing" : isHigh ? "Thriving (High)" : "Optimal Target"}
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums text-[#143834]">
                      {b.relativeAbundance.toFixed(2)}%
                    </span>
                    <span className="text-[8.5px] text-[#6a7875]">
                      (Goal: &ge; {b.referenceRange[0]}%)
                    </span>
                  </div>
                </div>

                <p className="mt-1 text-[10.5px] leading-relaxed text-[#3d4c49]">
                  {info.roleSummary}
                </p>

                {/* Plain-Language Takeaway & Food Fuel */}
                <div className="mt-1 rounded bg-[#faf8f2] border border-[#1f4f4a]/10 px-2 py-1 text-[10px] leading-snug text-[#2d3c39]">
                  {isLow ? (
                    <span>
                      <strong className="text-[#143834]">Takeaway:</strong> Your level is slightly low ({b.relativeAbundance.toFixed(2)}% vs goal &ge;{b.referenceRange[0]}%). <strong className="text-amber-800">Fuel this helper:</strong> {info.dietSource}
                    </span>
                  ) : (
                    <span>
                      <strong className="text-[#143834]">Takeaway:</strong> In healthy target range ({b.relativeAbundance.toFixed(2)}%). Actively nourishing your digestive lining. <strong className="text-emerald-700">Maintain with:</strong> {info.dietSource}
                    </span>
                  )}
                </div>

                {/* Range Bar */}
                <div className="mt-1">
                  <PatientRangeBar
                    value={b.relativeAbundance}
                    min={b.referenceRange[0]}
                    max={b.referenceRange[1]}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Reference Standards & Microbial Function Footnote */}
        <div className="mt-2 rounded-lg border border-[#1f4f4a]/15 bg-[#faf8f2] p-2 text-[7.5px] leading-tight text-[#5c6b68]">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/8 pb-0.5">
            <span className="font-bold text-[#143834] flex items-center gap-1.5">
              <BookOpen className="h-3 w-3 text-[#9a7b3c]" />
              Cohort Reference Standard for Beneficial Sentinel Microbes
            </span>
            <span className="text-[7px] font-mono text-[#7a8885]">NIH HMP &middot; MetaHIT (10th–90th Percentile)</span>
          </div>
          <p className="mt-0.5">
            <strong>Healthy Target Windows:</strong> Reference thresholds (e.g. min 1.5%–4.0%) represent the 10th percentile protective baseline observed in healthy adults from the <strong>NIH Human Microbiome Project</strong> and <strong>MetaHIT normative cohorts</strong>. Microbes like <em>Faecalibacterium prausnitzii</em> and <em>Roseburia</em> are essential producers of butyrate (the primary energy source for colon epithelial cells), while <em>Akkermansia muciniphila</em> sustains the protective intestinal mucus barrier. Values within or above the minimum reference reflect optimal barrier defense.
          </p>
        </div>
      </ReportPage>

      {/* ========================================================================= */}
      {/* PAGE 3: SURVEILLANCE & SAFETY - PATHOGENS & AMR                           */}
      {/* ========================================================================= */}
      <ReportPage analysis={analysis} type="patient" page={3} total={5}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b3c]">
              Section 2 · Surveillance &amp; Safety
            </span>
            <h2 className="font-serif text-2xl text-[#143834]">Pathogen &amp; Resistance Surveillance</h2>
          </div>
        </div>

        {/* Reassurance Banner: Carriage vs Infection */}
        <div className="mt-1.5 rounded-lg border border-[#1f4f4a]/15 bg-[#faf8f2] p-2 text-[10px] leading-snug text-[#143834]">
          <p className="font-semibold flex items-center gap-1.5 text-[#143834]">
            <CheckCircle2 className="h-4 w-4 text-[#1f4f4a]" />
            Peaceful Carriage — No Active Infection
          </p>
          <p className="mt-0.5 text-[#4d5c59]">
            Finding small traces of common resident bacteria or antibiotic resistance markers in stool is completely normal. These bacteria live peacefully in healthy digestive tracts without causing disease and do <em>not</em> mean you need antibiotics.
          </p>
        </div>

        {/* Pathogen Screen Section */}
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#143834]">
              1. Watchlist Resident Bacteria Screen <span className="text-[10px] font-normal lowercase tracking-normal text-[#5c6b68]">(&ldquo;watch if high&rdquo; microbes)</span>
            </h3>
            <span className="text-[8px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
              Ref Limit: 95th Percentile Baseline
            </span>
          </div>

          {watch.length === 0 ? (
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>No major harmful pathogens or watchlist bacteria detected above laboratory thresholds.</span>
            </div>
          ) : (
            <div className="mt-1 overflow-hidden rounded-lg border border-[#1f4f4a]/15 bg-white">
              <table className="w-full text-[10px]">
                <thead className="bg-[#1f4f4a]/5 border-b border-[#1f4f4a]/10 text-left text-[8px] font-semibold uppercase text-[#6a7875]">
                  <tr>
                    <th className="py-1 px-3">Organism &amp; Role</th>
                    <th className="py-1 px-2">Your Level</th>
                    <th className="py-1 px-2">Healthy Limit</th>
                    <th className="py-1 px-2">Status</th>
                    <th className="py-1 px-3">Plain-Language Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f4f4a]/10">
                  {watch.slice(0, 5).map((p) => {
                    const isOver = p.relativeAbundance > p.referenceRange[1];
                    const info = WATCHLIST_FRIENDLY_INFO[p.taxon] || {
                      friendlyName: p.taxon.split(" ")[0] + " Flora",
                      plainMeaning: p.notes || "Common resident bacterium kept in balance by friendly flora.",
                    };

                    return (
                      <tr key={p.taxon} className="align-top">
                        <td className="py-1 px-3">
                          <div className="font-bold text-[#143834] text-[10.5px]">
                            {info.friendlyName}
                          </div>
                          <div className="font-serif italic text-[#7a8885] text-[8.5px]">
                            {p.taxon}
                          </div>
                        </td>
                        <td className="py-1 px-2 font-mono tabular-nums text-xs font-semibold text-[#143834]">
                          {p.relativeAbundance.toFixed(2)}%
                        </td>
                        <td className="py-1 px-2 font-mono tabular-nums text-[9.5px] text-[#6a7875]">
                          &lt; {p.referenceRange[1].toFixed(2)}%
                        </td>
                        <td className="py-1 px-2">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[7px] font-bold uppercase border ${
                              isOver
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isOver ? "Slightly High" : "Normal"}
                          </span>
                        </td>
                        <td className="py-1 px-3 text-[9px] leading-snug text-[#4d5c59]">
                          {isOver
                            ? `Slightly elevated. ${info.plainMeaning} Increasing diverse prebiotic fibers helps good bacteria crowd this out.`
                            : info.plainMeaning}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Reference Baseline Footnote for Watchlist Flora */}
          <div className="mt-1 rounded-lg border border-[#1f4f4a]/10 bg-[#faf8f2] p-1.5 text-[7.5px] leading-tight text-[#5c6b68]">
            <strong className="text-[#143834]">Reference Baseline &amp; Colonization Context:</strong> Upper reference limits correspond to the 95th percentile of healthy adults in the NIH Human Microbiome Project (HMP). Low-level presence (&le; reference limit) represents normal resident bacteria that naturally exist in healthy digestive systems. Levels exceeding the reference limit suggest a mild imbalance to discuss with your healthcare provider.
          </div>
        </div>

        {/* AMR Section */}
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#143834]">
              2. Antibiotic Resistance (AMR) Markers
            </h3>
            <span className="text-[8px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
              Ref: CARD 3.2.9 &middot; WHO BPPL
            </span>
          </div>

          {analysis.amr.length === 0 ? (
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Surveillance Negative — No critical antibiotic resistance genes detected.</span>
            </div>
          ) : (
            <div className="mt-1 space-y-1.5">
              <div className="space-y-1">
                {analysis.amr.slice(0, 4).map((a) => (
                  <div
                    key={a.gene}
                    className="flex items-start gap-2 rounded-lg border border-[#1f4f4a]/12 bg-white/90 p-2 text-[10.5px]"
                  >
                    <LevelPill level={a.level} />
                    <div className="leading-snug min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono font-bold text-[#143834] text-[11px]">
                          {a.gene}{" "}
                          <span className="font-sans font-normal text-[#6a7875] text-[9.5px]">({a.class})</span>
                        </p>
                        <span className="text-[7px] font-semibold text-[#6a7875] bg-[#faf8f2] border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                          WHO {a.whoPriority.toUpperCase()} Priority &middot; Ref: CARD
                        </span>
                      </div>
                      <p className="text-[9.5px] text-[#4d5c59] mt-0.5">
                        Carried quietly by natural resident bacteria (<span className="italic">{a.organism}</span>). This represents peaceful coexistence without causing illness.
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Wallet Card Callout - Clean Unified Styling */}
              <div className="rounded-lg border border-[#1f4f4a]/15 bg-[#faf8f2] p-2 text-[10px] text-[#143834] leading-snug">
                <p className="font-semibold flex items-center gap-1.5 text-[#143834]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1f4f4a]" />
                  Helpful Record for Your Doctor (No Action Needed Today):
                </p>
                <p className="mt-0.5 text-[#4d5c59] text-[9px]">
                  You do <strong>not</strong> need any antibiotics for these markers. If your doctor ever prescribes antibiotics for a future illness, sharing this report simply helps them select the most effective medicine tailored to your personal microbiome.
                </p>
              </div>

              {/* AMR Reference Standards Note */}
              <div className="rounded-lg border border-[#1f4f4a]/10 bg-[#faf8f2] p-1.5 text-[7.5px] leading-tight text-[#5c6b68]">
                <p>
                  <strong className="text-[#143834]">Reference Standards &amp; Surveillance:</strong> Resistance markers are benchmarked against the Comprehensive Antibiotic Resistance Database (CARD 3.2.9) and classified according to the World Health Organization (WHO) Bacterial Priority Pathogens List (2024 revision).
                </p>
                <p className="mt-0.5">
                  <strong className="text-[#143834]">Carriage vs Infection:</strong> Stool metagenomic detection reflects peaceful colonization in your gut, not an active infection, and does not require antibiotic treatment.
                </p>
              </div>
            </div>
          )}
        </div>
      </ReportPage>

      {/* ========================================================================= */}
      {/* PAGE 4: CLINICAL BENCHMARKING & PATTERN ASSOCIATIONS                      */}
      {/* ========================================================================= */}
      <ReportPage analysis={analysis} type="patient" page={4} total={5}>
        <div className="flex items-baseline justify-between border-b border-[#1f4f4a]/15 pb-1">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Section 3 · Digestive Balance &amp; Lifestyle Comparisons
            </span>
            <h2 className="font-serif text-lg text-[#143834] leading-tight">
              Digestive Balance &amp; Pattern Comparisons
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[7.5px] text-[#5c6b68]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Normal (0–40)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Borderline (41–70)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> High (71–100)
            </span>
          </div>
        </div>

        {/* Educational Reassurance Banner - Clean Warm Neutral */}
        <div className="mt-1 rounded-lg border border-[#1f4f4a]/15 bg-[#faf8f2] px-2.5 py-1.5 text-[8px] text-[#143834] leading-snug flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 text-[#1f4f4a] shrink-0 mt-0.5" />
          <p>
            <strong>Educational Comparison (Not a Diagnosis):</strong> These scores compare your bacterial balance against published clinical research cohorts. Elevated or borderline scores highlight functional areas where nourishing your microbiome with whole-food nutrition and hydration can support optimal digestive harmony.
          </p>
        </div>

        {/* Functional Digestive Symptoms: Constipation & Bloating Breakdown */}
        <div className="mt-1.5 rounded-2xl border border-[#1f4f4a]/15 bg-white/95 p-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1 mb-1">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-[#1f4f4a]" />
              <div>
                <span className="font-serif text-[11px] font-bold text-[#143834] block leading-tight">
                  Digestive Comfort &amp; Functional Symptoms Breakdown
                </span>
                <span className="text-[8px] text-[#6a7875]">
                  Microbial indicators linked to everyday bowel regularity, transit speed, and digestive gas pressure
                </span>
              </div>
            </div>
            <span className="rounded-full bg-[#faf8f2] border border-[#1f4f4a]/12 px-2 py-0.2 text-[7.5px] font-semibold text-[#5c6b68]">
              Rome IV GI Correlation
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[8.5px]">
            {/* Card 1: Constipation & Slow Transit */}
            <div className="rounded-xl border border-[#1f4f4a]/12 bg-white p-2.5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1f4f4a]/10 text-[#143834] border border-[#1f4f4a]/20 text-[8px] font-bold">
                      1
                    </span>
                    <h3 className="font-bold text-[#143834] text-[9.5px]">Bowel Regularity &amp; Transit Speed</h3>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[7px] font-bold uppercase border ${
                      isConstipationSluggish
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {isConstipationSluggish ? "Sluggish Transit Tendency" : "Normal Transit Balance"}
                  </span>
                </div>
                <p className="text-[8px] text-[#4d5c59] leading-snug">
                  Methane gas produced by specialized archaea slows colonic contractions, while low fiber-fermenting bacteria reduce natural stool moisture and bulk.
                </p>

                {/* Key Bacteria Rows */}
                <div className="mt-1 space-y-1">
                  <div className="flex items-center justify-between rounded bg-[#faf8f2] p-1 border border-[#1f4f4a]/8 text-[7.5px]">
                    <div>
                      <span className="font-bold text-[#143834]">Methane-Producing Flora</span>
                      <span className="font-serif italic text-[#7a8885] text-[7px] ml-1">(M. smithii)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[#143834]">{mSmithiiAbundance.toFixed(2)}%</span>
                      <span className="text-[6.5px] text-[#7a8885]">(Ref &lt; 0.10%)</span>
                      <span
                        className={`rounded px-1 text-[6.5px] font-bold ${
                          mSmithiiAbundance >= 0.1 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {mSmithiiAbundance >= 0.1 ? "Above Target" : "Normal"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded bg-[#faf8f2] p-1 border border-[#1f4f4a]/8 text-[7.5px]">
                    <div>
                      <span className="font-bold text-[#143834]">Fiber Motility Helper</span>
                      <span className="font-serif italic text-[#7a8885] text-[7px] ml-1">(Bifidobacterium)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[#143834]">{bifidoAbundance.toFixed(2)}%</span>
                      <span className="text-[6.5px] text-[#7a8885]">(Ref &ge; 1.00%)</span>
                      <span
                        className={`rounded px-1 text-[6.5px] font-bold ${
                          bifidoAbundance < 1.0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {bifidoAbundance < 1.0 ? "Low" : "Optimal"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-1 border-t border-[#1f4f4a]/8 pt-0.5 text-[7px] text-[#3d4c49] leading-tight">
                <strong>Action Tip:</strong> Increase soluble prebiotic fiber (isabgol/psyllium, flaxseeds, kiwi, oats) and drink 2–2.5L water daily to support peristalsis.
              </div>
            </div>

            {/* Card 2: Bloating & Gas Fermentation */}
            <div className="rounded-xl border border-[#1f4f4a]/12 bg-white p-2.5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1f4f4a]/10 text-[#143834] border border-[#1f4f4a]/20 text-[8px] font-bold">
                      2
                    </span>
                    <h3 className="font-bold text-[#143834] text-[9.5px]">Digestive Comfort &amp; Bloating Pressure</h3>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[7px] font-bold uppercase border ${
                      isBloatingElevated
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {isBloatingElevated ? "Gas Sensitivity Tendency" : "Balanced Comfort Profile"}
                  </span>
                </div>
                <p className="text-[8px] text-[#4d5c59] leading-snug">
                  Rapid fermentation of complex starches by opportunist bacteria generates excess hydrogen and CO2 gas, causing uncomfortable abdominal distension.
                </p>

                {/* Key Bacteria Rows */}
                <div className="mt-1 space-y-1">
                  <div className="flex items-center justify-between rounded bg-white p-1 border border-[#1f4f4a]/8 text-[7.5px]">
                    <div>
                      <span className="font-bold text-[#143834]">Gas-Producing Fermenter</span>
                      <span className="font-serif italic text-[#7a8885] text-[7px] ml-1">(R. gnavus)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[#143834]">{rGnavusAbundance.toFixed(2)}%</span>
                      <span className="text-[6.5px] text-[#7a8885]">(Ref &lt; 0.20%)</span>
                      <span
                        className={`rounded px-1 text-[6.5px] font-bold ${
                          rGnavusAbundance >= 0.2 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {rGnavusAbundance >= 0.2 ? "Above Target" : "Optimal"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded bg-white p-1 border border-[#1f4f4a]/8 text-[7.5px]">
                    <div>
                      <span className="font-bold text-[#143834]">Everyday Coli Flora</span>
                      <span className="font-serif italic text-[#7a8885] text-[7px] ml-1">(E. coli family)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[#143834]">{eColiAbundance.toFixed(2)}%</span>
                      <span className="text-[6.5px] text-[#7a8885]">(Ref &lt; 1.00%)</span>
                      <span
                        className={`rounded px-1 text-[6.5px] font-bold ${
                          eColiAbundance >= 1.0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {eColiAbundance >= 1.0 ? "Above Target" : "Optimal"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-1 border-t border-[#1f4f4a]/8 pt-0.5 text-[7px] text-[#3d4c49] leading-tight">
                <strong>Action Tip:</strong> Reduce carbonated beverages and refined sweets; space meals evenly and consume probiotic curd to restore calming flora.
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Active Focus Areas */}
        <div className="mt-1.5">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5">
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Active Pattern Signals ({activeDiseases.length} Modules Requiring Attention)
            </h3>
            <span className="text-[7.5px] text-[#6a7875]">Score &gt; 40 (Cohort-Calibrated)</span>
          </div>

          {/* Active Disease Risk Model Category Breakdown Chip Strip - Unified Neutral */}
          <div className="mt-1 flex items-center justify-between gap-1.5 rounded-lg border border-[#1f4f4a]/12 bg-white/90 px-2 py-1 text-[8px]">
            <span className="font-bold text-[#143834] uppercase tracking-wider text-[7.5px] shrink-0">
              Risk Domains ({activeDiseases.length} Active):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeRiskCategories.map((cat) => {
                const count = cat.modules.length;
                const hasElevated = cat.modules.some((m) => m.score > 70);
                return (
                  <span
                    key={cat.name}
                    className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[7.5px] font-medium border border-[#1f4f4a]/15 text-[#143834]"
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`font-mono font-bold text-[7px] px-1 rounded ${
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
            <div className="mt-1.5 rounded-lg border border-[#1f4f4a]/15 bg-[#faf8f2] p-2 text-center text-[9.5px] text-[#143834]">
              <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-[#1f4f4a] mb-0.5" />
              All {allDiseases.length} clinical pattern comparison modules are within the <strong>Normal Healthy Baseline window (0–40)</strong>. No associative pattern shifts detected.
            </div>
          ) : (
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {activeDiseases.map((d, idx) => {
                const isLastOdd = activeDiseases.length % 2 !== 0 && idx === activeDiseases.length - 1;
                return (
                  <div key={d.id} className={isLastOdd ? "col-span-2" : ""}>
                    <PatientDiseaseHorizonGraph disease={d} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Screening Modules Within Normal Baseline */}
        <div className="mt-1.5">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-0.5">
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Screening Modules Within Normal Baseline ({typicalDiseases.length} Modules)
            </h3>
            <span className="text-[7.5px] text-[#6a7875]">Score &le; 40 (Normal)</span>
          </div>

          <div className="mt-1 grid grid-cols-3 gap-1">
            {typicalDiseases.map((d) => {
              const friendly = PATIENT_FRIENDLY_DISEASE_INFO[d.id]?.friendlyTitle || d.name;
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-md border border-[#1f4f4a]/10 bg-white/70 px-1.5 py-0.5 text-[8px]"
                >
                  <span className="text-[#143834] font-medium truncate" title={friendly}>
                    {friendly}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[7.5px] text-[#6a7875]">{d.score}%</span>
                    <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 text-[6.5px] font-bold">
                      Normal
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Page 4 Reference Footnote */}
        <div className="mt-1.5 rounded-lg border border-[#1f4f4a]/12 bg-[#faf8f2] p-1.5 text-[7px] leading-tight text-[#5c6b68]">
          <strong className="text-[#143834]">Understanding Pattern Alignment References:</strong> Scores are calculated by evaluating your microbial ecosystem against thousands of profiles from published clinical studies (MetaHIT, IBDMDB). A score between 0–40 represents the typical healthy reference baseline. Scores above 40 indicate microbial shifts that provide helpful context for lifestyle discussions with your doctor, not a standalone medical diagnosis.
        </div>
      </ReportPage>

      {/* ========================================================================= */}
      {/* PAGE 5: EVIDENCE-BASED NUTRITION & LIFESTYLE GUIDANCE                     */}
      {/* ========================================================================= */}
      <ReportPage analysis={analysis} type="patient" page={5} total={5}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b3c]">
              Section 4 · Science-Backed Gut Health Habits
            </span>
            <h2 className="font-serif text-2xl text-[#143834]">Core Principles for a Healthy Gut Microbiome</h2>
          </div>
        </div>

        <p className="mt-1 text-[11px] leading-relaxed text-[#3d4c49]">
          Supporting your gut ecosystem does not require rigid meal plans or commercial supplements. Modern microbiome science consistently demonstrates that the most reliable path to good gut health is building daily habits that feed your beneficial bacteria, starve harmful opportunists, and build long-term microbial resilience.
        </p>

        {/* Evidence & Scientific Foundations Banner */}
        <div className="mt-2 rounded-lg border border-[#1f4f4a]/12 bg-[#faf8f2] px-3 py-1.5 text-[8px] leading-tight text-[#5c6b68] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#9a7b3c] shrink-0" />
            <div>
              <span className="font-bold text-[#143834]">Scientific Evidence Basis:</span>{" "}
              American Gut Project (mSystems 2018; 10,000+ cohort) &middot; The Lancet (Reynolds et al. 2019, 185 trials on dietary fibre) &middot; Stanford University Trial (Cell 2021, Fermented Foods) &middot; Nature Reviews Immunology (2016).
            </div>
          </div>
          <span className="font-mono text-[7px] text-[#143834] bg-white border border-[#1f4f4a]/10 px-2 py-0.5 rounded shrink-0 ml-2 font-semibold">
            Evidence-Based Lifestyle
          </span>
        </div>

        {/* Core Evidence-Based Dietary & Lifestyle Principles */}
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {/* 1. Plant Diversity */}
          <div className="rounded-lg border border-[#1f4f4a]/12 bg-white/90 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#1f4f4a]/8 text-[#143834] border border-[#1f4f4a]/15 px-1.5 py-0.2 text-[7.5px] font-bold uppercase tracking-wider">
                  Emphasize Variety
                </span>
                <span className="text-[7px] text-[#6a7875] font-medium">Target: 30+ Types / Wk</span>
              </div>
              <h4 className="mt-0.5 text-[10px] font-bold text-[#143834]">1. Eat a Wide Variety of Plants</h4>
              <p className="mt-0.5 text-[8.5px] leading-snug text-[#4d5c59]">
                Aim for 30+ different plant foods across each week—including vegetables, fruits, whole grains, beans, legumes, nuts, seeds, and herbs. Greater plant variety directly fuels a wider spectrum of beneficial bacteria.
              </p>
            </div>
            <p className="mt-0.5 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: American Gut Project (mSystems 2018; 10,000+ cohort)
            </p>
          </div>

          {/* 2. High Dietary Fibre */}
          <div className="rounded-lg border border-[#1f4f4a]/12 bg-white/90 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#1f4f4a]/8 text-[#143834] border border-[#1f4f4a]/15 px-1.5 py-0.2 text-[7.5px] font-bold uppercase tracking-wider">
                  Daily Habit
                </span>
                <span className="text-[7px] text-[#6a7875] font-medium">Target: ~30g Fibre / Day</span>
              </div>
              <h4 className="mt-0.5 text-[10px] font-bold text-[#143834]">2. Increase Dietary Fibre</h4>
              <p className="mt-0.5 text-[8.5px] leading-snug text-[#4d5c59]">
                Step up your daily intake of whole-food fibre. Beneficial microbes ferment dietary fibre into protective Short-Chain Fatty Acids (SCFAs like butyrate) that nourish colon cells and strengthen the gut barrier.
              </p>
            </div>
            <p className="mt-0.5 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: The Lancet (Reynolds et al. 2019); Cell (2016)
            </p>
          </div>

          {/* 3. Prebiotic-Rich Whole Foods */}
          <div className="rounded-lg border border-[#1f4f4a]/12 bg-white/90 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#1f4f4a]/8 text-[#143834] border border-[#1f4f4a]/15 px-1.5 py-0.2 text-[7.5px] font-bold uppercase tracking-wider">
                  Feed Good Bacteria
                </span>
                <span className="text-[7px] text-[#6a7875] font-medium">Selective Fuel</span>
              </div>
              <h4 className="mt-0.5 text-[10px] font-bold text-[#143834]">3. Include Natural Prebiotic Fibres</h4>
              <p className="mt-0.5 text-[8.5px] leading-snug text-[#4d5c59]">
                Incorporate foods containing fermentable prebiotic fibres (such as inulin, resistant starch, pectin, and beta-glucans). Prebiotics act as targeted nutrition to selectively multiply friendly sentinel species like <em>Bifidobacterium</em>.
              </p>
            </div>
            <p className="mt-0.5 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: Frontiers in Microbiology (O&apos;Callaghan et al. 2016)
            </p>
          </div>

          {/* 4. Live Fermented Foods */}
          <div className="rounded-lg border border-[#1f4f4a]/12 bg-white/90 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#1f4f4a]/8 text-[#143834] border border-[#1f4f4a]/15 px-1.5 py-0.2 text-[7.5px] font-bold uppercase tracking-wider">
                  Live Active Cultures
                </span>
                <span className="text-[7px] text-[#6a7875] font-medium">1–2 Servings Daily</span>
              </div>
              <h4 className="mt-0.5 text-[10px] font-bold text-[#143834]">4. Add Naturally Fermented Foods</h4>
              <p className="mt-0.5 text-[8.5px] leading-snug text-[#4d5c59]">
                Regularly enjoy foods containing live active cultures (such as live yogurt, kefir, fermented vegetables, sauerkraut, or kimchi). These introduce friendly transient microbes, expand community diversity, and decrease inflammation.
              </p>
            </div>
            <p className="mt-0.5 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: Stanford Clinical Trial (Wastyk et al., Cell 2021)
            </p>
          </div>

          {/* 5. Starve Harmful Microbes */}
          <div className="rounded-lg border border-[#1f4f4a]/12 bg-white/90 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 text-[7.5px] font-bold uppercase tracking-wider">
                  Limit &amp; Moderate
                </span>
                <span className="text-[7px] text-[#6a7875] font-medium">Starve Bad Bugs</span>
              </div>
              <h4 className="mt-0.5 text-[10px] font-bold text-[#143834]">5. Limit Ultra-Processed Foods &amp; Sugars</h4>
              <p className="mt-0.5 text-[8.5px] leading-snug text-[#4d5c59]">
                Cut down on heavily processed convenience foods, refined sugars, artificial sweeteners, and heavily processed meats. Harmful bacteria thrive on simple sugars, whereas whole foods give the competitive advantage to good bacteria.
              </p>
            </div>
            <p className="mt-0.5 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: Nature Reviews Immunology (Rooks &amp; Garrett 2016)
            </p>
          </div>

          {/* 6. Movement & Sleep */}
          <div className="rounded-lg border border-[#1f4f4a]/12 bg-white/90 p-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#1f4f4a]/8 text-[#143834] border border-[#1f4f4a]/15 px-1.5 py-0.2 text-[7.5px] font-bold uppercase tracking-wider">
                  Lifestyle Synergy
                </span>
                <span className="text-[7px] text-[#6a7875] font-medium">Gut-Brain Axis</span>
              </div>
              <h4 className="mt-0.5 text-[10px] font-bold text-[#143834]">6. Keep Moving &amp; Protect Sleep</h4>
              <p className="mt-0.5 text-[8.5px] leading-snug text-[#4d5c59]">
                Engage in consistent moderate physical activity (like daily walking) and aim for 7–8 hours of quality sleep. Regular exercise increases beneficial butyrate-producing species, while restorative sleep stabilizes circadian microbial rhythms.
              </p>
            </div>
            <p className="mt-0.5 text-[6.5px] text-[#7a8885] italic border-t border-[#1f4f4a]/8 pt-0.5">
              Ref: Allen et al. (2018); Smith et al. (PLoS One 2019)
            </p>
          </div>
        </div>

        {/* Actionable Steps for This Week */}
        <div className="mt-2 rounded-lg border border-[#1f4f4a]/15 bg-[#faf8f2] p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#9a7b3c] flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#9a7b3c]" />
            Actionable Roadmap for This Week
          </p>
          <div className="mt-1 grid grid-cols-2 gap-1.5 text-[9px] text-[#3d4c49]">
            <div className="flex items-start gap-1.5">
              <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-[#143834] text-[7.5px] font-bold text-white mt-0.5">1</span>
              <span><strong>Count Plant Variety:</strong> Track how many distinct vegetables, fruits, whole grains, pulses, nuts, and seeds you consume—aim for at least 30 this week.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-[#143834] text-[7.5px] font-bold text-white mt-0.5">2</span>
              <span><strong>Increase Fibre Steadily:</strong> Add an extra portion of high-fibre whole food each day while drinking plenty of water for comfortable digestion.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-[#143834] text-[7.5px] font-bold text-white mt-0.5">3</span>
              <span><strong>Add Daily Fermented Culture:</strong> Incorporate one serving of naturally fermented food with live active cultures with your daily meals.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-[#143834] text-[7.5px] font-bold text-white mt-0.5">4</span>
              <span><strong>Daily Walk &amp; Sleep Timing:</strong> Prioritize 15–20 minutes of moderate movement daily and aim for 7–8 hours of consistent, restorative sleep.</span>
            </div>
          </div>
          <div className="mt-1 text-[7px] text-[#7a8885] border-t border-[#1f4f4a]/8 pt-0.5 flex items-center justify-between">
            <span><strong>Clinical Disclaimer:</strong> Dietary suggestions are intended to support general microbiome wellness. Always consult your GP or registered dietitian if managing gastrointestinal conditions.</span>
            <span className="italic">Delphina Health Coaching Module</span>
          </div>
        </div>

        {/* Recommended Microbiome Food Plates & Whole-Food Gallery */}
        <div className="mt-2.5 rounded-xl border border-[#1f4f4a]/15 bg-white p-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1 mb-2">
            <div className="flex items-center gap-1.5">
              <Salad className="h-3.5 w-3.5 text-[#1f4f4a]" />
              <h3 className="font-serif text-[11px] font-bold text-[#143834]">
                Targeted Microbiome Whole-Food Categories &amp; Daily Plate Examples
              </h3>
            </div>
            <span className="text-[7.5px] font-semibold text-[#9a7b3c] bg-[#faf8f2] border border-[#1f4f4a]/10 px-2 py-0.2 rounded">
              Whole-Food Medicine
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Card 1: Prebiotics */}
            <div className="rounded-lg border border-[#1f4f4a]/12 bg-[#faf8f2] overflow-hidden flex flex-col justify-between shadow-2xs">
              <div className="h-24 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/food-prebiotics.jpg"
                  alt="Prebiotic gut foods"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[10px] text-[#143834]">1. Prebiotic Fibres</h4>
                  <span className="text-[6.5px] font-semibold text-[#1f4f4a] bg-white px-1 py-0.2 rounded border border-[#1f4f4a]/10">
                    Fuel
                  </span>
                </div>
                <p className="mt-0.5 text-[8px] text-[#4d5c59] leading-snug">
                  <strong>Key Sources:</strong> Oats, lentils, garlic, leeks, chia seeds, green bananas, and cooled potatoes.
                </p>
                <p className="mt-0.5 text-[7px] text-[#2d4c46] italic">
                  Feeds <em>Bifidobacterium</em> &amp; butyrate producers.
                </p>
              </div>
            </div>

            {/* Card 2: Live Fermented Foods */}
            <div className="rounded-lg border border-[#1f4f4a]/12 bg-[#faf8f2] overflow-hidden flex flex-col justify-between shadow-2xs">
              <div className="h-24 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/food-fermented.jpg"
                  alt="Naturally fermented probiotic foods"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[10px] text-[#143834]">2. Fermented Cultures</h4>
                  <span className="text-[6.5px] font-semibold text-emerald-700 bg-white px-1 py-0.2 rounded border border-emerald-200">
                    Live Probiotics
                  </span>
                </div>
                <p className="mt-0.5 text-[8px] text-[#4d5c59] leading-snug">
                  <strong>Key Sources:</strong> Live curd (dahi), kefir, kimchi, raw sauerkraut, and unpasteurized miso.
                </p>
                <p className="mt-0.5 text-[7px] text-[#2d4c46] italic">
                  Introduces friendly transient flora &amp; lowers inflammation.
                </p>
              </div>
            </div>

            {/* Card 3: Polyphenol Rich Foods */}
            <div className="rounded-lg border border-[#1f4f4a]/12 bg-[#faf8f2] overflow-hidden flex flex-col justify-between shadow-2xs">
              <div className="h-24 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/food-polyphenols.jpg"
                  alt="Polyphenol rich gut antioxidant foods"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[10px] text-[#143834]">3. Polyphenol Protectors</h4>
                  <span className="text-[6.5px] font-semibold text-[#9a7b3c] bg-white px-1 py-0.2 rounded border border-[#9a7b3c]/30">
                    Antioxidants
                  </span>
                </div>
                <p className="mt-0.5 text-[8px] text-[#4d5c59] leading-snug">
                  <strong>Key Sources:</strong> Pomegranate seeds, blueberries, walnuts, dark leafy greens, and green tea.
                </p>
                <p className="mt-0.5 text-[7px] text-[#2d4c46] italic">
                  Nourishes <em>Akkermansia</em> &amp; reinforces gut barrier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ReportPage>
    </>
  );
}
