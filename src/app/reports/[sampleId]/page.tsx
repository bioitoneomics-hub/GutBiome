import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { analyzeSample } from "@/lib/microbiome/engine";
import { getBiomTable, getSample, listReportsForSample } from "@/lib/store";
import { CheckCircle2, FileCheck2, Clock, ShieldCheck, Database, ArrowRight, Download } from "lucide-react";
import { ReportHubActions } from "@/components/reports/report-hub-actions";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";

export default async function ReportHubPage({
  params,
}: {
  params: Promise<{ sampleId: string }>;
}) {
  const { sampleId } = await params;
  const sample = await getSample(sampleId);
  if (!sample) notFound();
  const biom = await getBiomTable(sampleId);
  const analysis = analyzeSample(sample, biom);
  const dbReports = await listReportsForSample(sampleId);

  const doctorReport = dbReports.find((r) => r.reportType === "doctor");
  const patientReport = dbReports.find((r) => r.reportType === "patient");
  const detailedReport = dbReports.find((r) => r.reportType === "detailed");

  const reports = [
    {
      id: "doctor",
      href: `/reports/${sampleId}/doctor`,
      title: "Doctor-centric Brief",
      pages: "3 printable pages",                                                                                                                                                                                                                                                                                                               
      blurb: "High-density AMR pathogen matrix, 11 disease risk meters, treatment guidance, and accredited physician sign-off.",
      record: doctorReport,
    },
    {
      id: "patient",
      href: `/reports/${sampleId}/patient`,
      title: "Patient-centric Guide",
      pages: "5 printable pages",
      blurb: "Jargon-free Gut Score, helpful microbes spotlight, plain-language antibiotic guidance, and targeted grocery list.",
      record: patientReport,
    },
    {
      id: "detailed",
      href: `/reports/${sampleId}/detailed`,
      title: "Detailed Scientific Report",
      pages: "Up to 30 pages",
      blurb: "Sequencer QC, deep taxonomy hierarchy down to species, resistome catalog, functional pathways, and references.",
      record: detailedReport,
    },
  ];

  return (
    <div className="min-h-full pb-16">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-xs">
          <Link href="/" className="text-[#1f4f4a] underline-offset-2 hover:underline">
            ← Back to Dashboard &amp; Accessions
          </Link>
        </p>

        {/* Case Header */}
        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#9a7b3c]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                {sample.source === "biom" ? "BIOM Import Ingestion" : "Standard LIMS Accession"}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <Database className="h-3 w-3" /> Biomine_DB MySQL Connected
              </span>
              <span className="border-l border-[#1f4f4a]/20 pl-2">
                <MyGutBiomeLogo variant="light" height={16} className="h-4 w-auto object-contain" />
              </span>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-bold text-[#143834]">{sample.displayName}</h1>
            <p className="mt-1 text-sm text-[#4d5c59]">
              Accession: <strong className="font-mono text-[#143834]">{sample.accession}</strong> · Patient MRN:{" "}
              <strong className="font-mono text-[#143834]">{sample.patientCode}</strong>
              {sample.biomFileName ? ` · Matrix: ${sample.biomFileName} (${sample.biomSampleId})` : ""}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#3d4c49] max-w-2xl bg-white/60 p-2.5 rounded-xl border border-[#1f4f4a]/10">
              <span className="font-semibold text-[#143834]">Clinical Indication:</span> {sample.indication}
            </p>
          </div>

          <ReportHubActions
            sampleId={sampleId}
            accession={sample.accession}
            sampleName={sample.displayName}
            patientCode={sample.patientCode}
          />
        </div>

        {/* Analytical Metric Highlights */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#1f4f4a]/15 bg-white p-3.5 shadow-xs">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#6a7875]">Gut Integrity</p>
            <p className="font-serif text-3xl font-bold text-[#143834]">{analysis.gutScore}<span className="text-xs font-sans text-[#7a8885]">/100</span></p>
            <p className="mt-0.5 text-[10px] text-[#5a6865]">Population baseline</p>
          </div>
          <div className="rounded-xl border border-[#1f4f4a]/15 bg-white p-3.5 shadow-xs">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#6a7875]">Shannon Diversity</p>
            <p className={`font-serif text-3xl font-bold ${analysis.diversity.shannon < 3.2 ? "text-rose-700" : "text-[#143834]"}`}>
              {analysis.diversity.shannon.toFixed(2)}
            </p>
            <p className="mt-0.5 text-[10px] text-[#5a6865]">Ref window &gt; 3.5</p>
          </div>
          <div className="rounded-xl border border-[#1f4f4a]/15 bg-white p-3.5 shadow-xs">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#6a7875]">AMR Determinants</p>
            <p className={`font-serif text-3xl font-bold ${analysis.amr.length > 0 ? "text-rose-700" : "text-emerald-700"}`}>
              {analysis.amr.length}
            </p>
            <p className="mt-0.5 text-[10px] text-[#5a6865]">CARD resistance calls</p>
          </div>
          <div className="rounded-xl border border-[#1f4f4a]/15 bg-white p-3.5 shadow-xs">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#6a7875]">Active Pathogens</p>
            <p className="font-serif text-3xl font-bold text-[#143834]">
              {analysis.pathogens.filter((p) => p.relativeAbundance > 0).length}
            </p>
            <p className="mt-0.5 text-[10px] text-[#5a6865]">Screened organisms</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="mt-8 flex items-center justify-between border-b border-[#1f4f4a]/15 pb-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#143834]">
              Generated Clinical Reports &amp; LIMS Sign-Off Status
            </h2>
            <p className="text-xs text-[#5c6b68]">
              Live status synchronized with MySQL Biomine_DB reports table.
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            {dbReports.length} records in reports table
          </span>
        </div>

        {/* Report Cards with Live Database Status */}
        <div className="mt-4 grid gap-4">
          {reports.map((r) => {
            const isSigned = r.record?.status === "signed_off";

            return (
              <div
                key={r.href}
                className="flex flex-col justify-between rounded-2xl border border-[#1f4f4a]/20 bg-white p-5 shadow-xs hover:border-[#1f4f4a]/50 transition-all sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                      {r.pages}
                    </span>
                    {isSigned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Signed Off ({r.record?.signedOffBy})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-bold text-teal-800">
                        <FileCheck2 className="h-3 w-3" />
                        Generated in LIMS
                      </span>
                    )}
                    {r.record?.updatedAt && (
                      <span className="flex items-center gap-1 text-[10px] text-[#7a8885] font-mono">
                        <Clock className="h-3 w-3" />
                        Synced {r.record.updatedAt.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-serif text-xl font-bold text-[#143834]">{r.title}</h3>
                  <p className="mt-1 text-xs text-[#4d5c59] leading-relaxed max-w-xl">{r.blurb}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/api/reports/${sampleId}/pdf?type=${r.id}`}
                    download
                    title={`Download ${r.title} PDF`}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#1f4f4a]/20 bg-[#fbf8f1] px-3 text-xs font-semibold text-[#143834] hover:bg-[#1f4f4a] hover:text-white transition-colors shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5 text-[#9a7b3c]" />
                    <span>PDF</span>
                  </a>

                  <Link
                    href={r.href}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#1f4f4a] px-4 text-xs font-semibold text-white hover:bg-[#143834] transition-colors shadow-xs"
                  >
                    <span>View Report</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
