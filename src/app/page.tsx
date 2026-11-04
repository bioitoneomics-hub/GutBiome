import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FolderArchive,
  Layers,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { listSamples, getBiomTable, listReportsForSample } from "@/lib/store";
import { analyzeSample } from "@/lib/microbiome/engine";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clinical Hub | ONEOMICS MYGUTBIOME",
  description:
    "Executive clinical genomics hub, patient accession management, doctor sign-off queue, and automated batch reporting.",
};

export default async function HomePage() {
  const samples = await listSamples();
  const sampleAnalyses = await Promise.all(
    samples.map(async (s) => {
      const biom = await getBiomTable(s.id);
      const a = analyzeSample(s, biom);
      const reports = await listReportsForSample(s.id);
      const doctorReport = reports.find((r) => r.reportType === "doctor");
      return {
        s,
        a,
        reports,
        doctorReport,
      };
    })
  );

  const totalSamples = sampleAnalyses.length;
  const biomCount = sampleAnalyses.filter((it) => it.s.source === "biom").length;

  // Sign-Off Metrics
  const signedOffCount = sampleAnalyses.filter(
    (it) => it.doctorReport?.status === "signed_off"
  ).length;
  const pendingSignOffCount = totalSamples - signedOffCount;

  // Gut Health Stratification
  const balancedCount = sampleAnalyses.filter((it) => it.a.gutScore >= 40).length;
  const recoveryCount = sampleAnalyses.filter((it) => it.a.gutScore < 40).length;

  // Pending Samples Queue (for doctor sign-off queue)
  const pendingSamples = sampleAnalyses.filter(
    (it) => it.doctorReport?.status !== "signed_off"
  );
  const sortedPending = [...pendingSamples].sort(
    (a, b) =>
      new Date(b.s.createdAt || b.s.collectionDate).getTime() -
      new Date(a.s.createdAt || a.s.collectionDate).getTime()
  );

  return (
    <div className="min-h-full pb-16">
      <AppHeader title="Clinical Hub" />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* ========================================================= */}
        {/* SECTION 1: CLINICAL HUB HEADER                           */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1f4f4a]/10 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-bold text-[#143834] tracking-tight">
                Clinical Hub
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#143834]/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#143834]">
                <Activity className="h-3 w-3 text-[#1f4f4a]" />
                Live Laboratory Telemetry
              </span>
            </div>
            <p className="mt-1 text-xs text-[#5a6865]">
              Executive patient accession tracking, doctor sign-off queue, and multi-patient batch export operations.
            </p>
          </div>

          {/* Quick Access Status Badge */}
          <div className="flex items-center gap-2.5 rounded-xl border border-[#1f4f4a]/15 bg-white/80 px-3.5 py-2 shadow-xs backdrop-blur-sm shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-right">
              <p className="font-mono text-xs font-bold text-[#143834]">
                {totalSamples} Active Patient Cases
              </p>
              <p className="text-[10px] text-[#7a8885]">
                {biomCount} Ingested BIOM · {totalSamples - biomCount} Benchmarks
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: 4 CLINICAL OPERATIONS STAT WIDGETS             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {/* Widget 1: Total Patients Registered */}
          <div className="rounded-2xl border border-[#1f4f4a]/15 bg-white/90 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6a7875]">
                  Total Patients
                </span>
                <Users className="h-4 w-4 text-[#1f4f4a]" />
              </div>
              <p className="mt-2 font-serif text-3xl font-bold text-[#143834]">
                {totalSamples}
              </p>
            </div>
            <div className="mt-2 border-t border-[#1f4f4a]/8 pt-1.5 flex items-center justify-between text-[10px] text-[#5a6865]">
              <span>Active Accessions</span>
              <span className="font-semibold text-[#143834]">{biomCount} Ingested BIOM</span>
            </div>
          </div>

          {/* Widget 2: Doctor Sign-Off Status */}
          <div className="rounded-2xl border border-[#1f4f4a]/15 bg-white/90 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6a7875]">
                  Sign-Off Status
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-serif text-3xl font-bold text-emerald-700">
                  {signedOffCount}
                </span>
                <span className="text-xs font-sans text-[#7a8885]">
                  / {totalSamples} Certified
                </span>
              </div>
            </div>
            <div className="mt-2 border-t border-[#1f4f4a]/8 pt-1.5 flex items-center justify-between text-[10px]">
              <span className="text-[#5a6865]">Pending Review</span>
              <span
                className={`font-semibold px-1.5 py-0.2 rounded ${
                  pendingSignOffCount > 0
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                {pendingSignOffCount > 0 ? `${pendingSignOffCount} Required` : "100% Certified"}
              </span>
            </div>
          </div>

          {/* Widget 3: Gut Health Stratification */}
          <div className="rounded-2xl border border-[#1f4f4a]/15 bg-white/90 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6a7875]">
                  Gut Stratification
                </span>
                <Activity className="h-4 w-4 text-[#9a7b3c]" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-serif text-3xl font-bold text-[#143834]">
                  {balancedCount}
                </span>
                <span className="text-xs font-sans text-[#7a8885]">Balanced</span>
              </div>
            </div>
            <div className="mt-2 border-t border-[#1f4f4a]/8 pt-1.5 flex items-center justify-between text-[10px] text-[#5a6865]">
              <span>Active Recovery (&lt;40)</span>
              <span className="font-semibold text-rose-700">{recoveryCount} Cases</span>
            </div>
          </div>

          {/* Widget 4: Ready Report Suites */}
          <div className="rounded-2xl border border-[#1f4f4a]/15 bg-white/90 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6a7875]">
                  Ready Reports
                </span>
                <FileSpreadsheet className="h-4 w-4 text-[#143834]" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-serif text-3xl font-bold text-[#143834]">
                  {totalSamples * 3}
                </span>
                <span className="text-xs font-sans text-[#7a8885]">PDF Suites</span>
              </div>
            </div>
            <div className="mt-2 border-t border-[#1f4f4a]/8 pt-1.5 flex items-center justify-between text-[10px] text-[#5a6865]">
              <span>Tier 1 · Tier 2 · Tier 3</span>
              <span className="font-semibold text-emerald-700">Export Ready</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: INGESTION PORTAL HERO BANNER                   */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-[#1f4f4a]/20 bg-gradient-to-br from-[#143834] via-[#102b28] to-[#0c2220] p-6 text-white shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#9a7b3c]/30 border border-[#9a7b3c]/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e6ca85]">
                  Metagenomic Ingestion Portal
                </span>
                <span className="text-xs text-white/60">
                  Direct Whole-Genome Shotgun (WGS) &amp; 16S Processing
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white tracking-tight sm:text-3xl">
                Ingest Patient Sequencing Matrices
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Import biological observation matrices from QIIME 2, Kraken 2, Bracken, or standard TSV formats.
                Delphina aligns microbial taxonomy against our 11 disease risk models, CARD AMR resistome, and keystone sentinel panels to automatically compile certified Doctor, Patient, and Detailed scientific reports.
              </p>
              <div className="pt-1 flex items-center gap-3 text-[11px] text-white/70 flex-wrap">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  QIIME 2 &amp; Kraken 2 Compatible
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Multi-Sample Cohort Support
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Automated 3-Tier PDF Generation
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#143834] shadow-sm hover:bg-[#faf8f1] transition-all hover:shadow"
              >
                <UploadCloud className="h-4 w-4 text-[#143834]" />
                <span>Upload Stool BIOM</span>
              </Link>
              <a
                href="/examples/example-gut.biom"
                download
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition-all"
              >
                <Download className="h-3.5 w-3.5 text-white/80" />
                <span>Download Sample BIOM</span>
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: TWO-COLUMN WORKFLOW HUB                        */}
        {/* Doctor Certification Queue (Left) + Batch Exports (Right) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Doctor Certification Queue (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-[#1f4f4a]/15 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <h3 className="font-serif text-lg font-bold text-[#143834]">
                    Doctor Certification Queue
                  </h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    pendingSignOffCount > 0
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {pendingSignOffCount > 0
                    ? `${pendingSignOffCount} Pending Review`
                    : "All Certified"}
                </span>
              </div>

              {sortedPending.length === 0 ? (
                <div className="py-8 text-center text-xs text-emerald-700 space-y-1">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                  <p className="font-bold text-sm text-[#143834]">
                    All Patient Reports Certified
                  </p>
                  <p className="text-[#5a6865]">
                    All {totalSamples} accessioned reports have been verified and signed off by Dr. Evelyn Reed.
                  </p>
                </div>
              ) : (
                <div className="mt-3 divide-y divide-slate-100">
                  {sortedPending.slice(0, 4).map(({ s, a }) => (
                    <div
                      key={s.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-lg px-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#143834]">
                            {s.patientCode}
                          </span>
                          <span className="text-[10px] text-[#7a8885] font-mono">
                            {s.accession}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                              a.gutScore >= 70
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : a.gutScore >= 40
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            Score: {a.gutScore}/100
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4d5c59] truncate mt-0.5">
                          {s.indication}
                        </p>
                      </div>

                      <Link
                        href={`/reports/${s.id}/doctor`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#1f4f4a]/20 bg-[#1f4f4a]/8 px-3 py-1.5 text-xs font-semibold text-[#143834] hover:bg-[#143834] hover:text-white transition-all shadow-2xs"
                      >
                        <span>Review &amp; Sign</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#1f4f4a]/10 flex items-center justify-between text-xs">
              <span className="text-[#6a7875] text-[11px]">
                Authorized Signer: <strong>Dr. Evelyn Reed, MD, FRCPath</strong>
              </span>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1 font-semibold text-[#1f4f4a] hover:text-[#143834] hover:underline"
              >
                <span>Full Directory ({totalSamples})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Column 2: 1-Click Multi-Patient Batch Exports (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-3">
                <div className="flex items-center gap-2">
                  <FolderArchive className="h-4 w-4 text-[#9a7b3c]" />
                  <h3 className="font-serif text-lg font-bold text-[#143834]">
                    1-Click Batch Exports
                  </h3>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[9.5px] font-semibold text-[#5a6865] border border-[#1f4f4a]/10">
                  Direct Archives
                </span>
              </div>

              <p className="mt-2.5 text-xs text-[#5a6865] leading-relaxed">
                Download compiled ZIP archives across all {totalSamples} active patient accessions, bundled with clinical manifest and analytics:
              </p>

              <div className="mt-3.5 space-y-2">
                <a
                  href="/api/reports/batch/export?type=doctor"
                  download
                  className="flex items-center justify-between rounded-xl border border-[#1f4f4a]/15 bg-white p-2.5 text-xs text-[#143834] hover:border-[#1f4f4a]/30 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#143834]/8 text-[#143834]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold block">Doctor Briefs (ZIP)</span>
                      <span className="text-[10px] text-[#7a8885]">
                        All 3-page clinical physician reports
                      </span>
                    </div>
                  </div>
                  <Download className="h-3.5 w-3.5 text-[#7a8885] group-hover:text-[#143834] transition-colors" />
                </a>

                <a
                  href="/api/reports/batch/export?type=patient"
                  download
                  className="flex items-center justify-between rounded-xl border border-[#1f4f4a]/15 bg-white p-2.5 text-xs text-[#143834] hover:border-[#1f4f4a]/30 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold block">Patient Guides (ZIP)</span>
                      <span className="text-[10px] text-[#7a8885]">
                        All 5-page patient-friendly wellness reports
                      </span>
                    </div>
                  </div>
                  <Download className="h-3.5 w-3.5 text-[#7a8885] group-hover:text-[#143834] transition-colors" />
                </a>

                <a
                  href="/api/reports/batch/export?type=detailed"
                  download
                  className="flex items-center justify-between rounded-xl border border-[#1f4f4a]/15 bg-white p-2.5 text-xs text-[#143834] hover:border-[#1f4f4a]/30 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9a7b3c]/15 text-[#9a7b3c]">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold block">Detailed Dossiers (ZIP)</span>
                      <span className="text-[10px] text-[#7a8885]">
                        Complete scientific metagenomic dossiers
                      </span>
                    </div>
                  </div>
                  <Download className="h-3.5 w-3.5 text-[#7a8885] group-hover:text-[#143834] transition-colors" />
                </a>

                <a
                  href="/api/reports/batch/csv"
                  download
                  className="flex items-center justify-between rounded-xl border border-[#1f4f4a]/15 bg-white p-2.5 text-xs text-[#143834] hover:border-[#1f4f4a]/30 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold block">Cohort Analytics (CSV)</span>
                      <span className="text-[10px] text-[#7a8885]">
                        Full spreadsheet with Shannon diversity &amp; AMR
                      </span>
                    </div>
                  </div>
                  <Download className="h-3.5 w-3.5 text-[#7a8885] group-hover:text-[#143834] transition-colors" />
                </a>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1f4f4a]/10 text-center">
              <Link
                href="/reports"
                className="text-xs font-semibold text-[#143834] hover:underline inline-flex items-center gap-1"
              >
                <span>Filter &amp; Select Individual Accessions</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
