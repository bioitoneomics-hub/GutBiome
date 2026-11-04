import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";
import { listSamples, listReportsForSample, getBiomTable } from "@/lib/store";
import { analyzeSample } from "@/lib/microbiome/engine";
import { ArrowLeft } from "lucide-react";
import { ReportsBatchManager } from "@/components/reports/reports-batch-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clinical Reports Directory | ONEOMICS MYGUTBIOME",
  description: "Browse, inspect, and access all generated doctor, patient, and detailed metagenomic reports.",
};

export default async function ReportsIndexPage() {
  const samples = await listSamples();
  const sampleData = await Promise.all(
    samples.map(async (s) => {
      const biom = await getBiomTable(s.id);
      const analysis = analyzeSample(s, biom);
      const reports = await listReportsForSample(s.id);
      const doctorReport = reports.find((r) => r.reportType === "doctor");
      return {
        sample: s,
        analysis,
        reports,
        doctorReport,
      };
    })
  );

  return (
    <div className="min-h-full pb-16">
      <AppHeader title="Generated Reports Directory" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f4f4a] hover:text-[#143834] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-[11px] text-[#7a8885] font-mono">
            {samples.length} Accessions · {samples.length * 3} Clinical Reports in MySQL
          </span>
        </div>

        {/* Page Header */}
        <div className="mt-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#9a7b3c]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Clinical Reports Index
            </span>
            <span className="text-[11px] text-[#7a8885] flex items-center gap-1.5">
              · ONEOMICS <MyGutBiomeLogo variant="light" height={16} className="h-4 w-auto object-contain inline-block" />
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#143834] tracking-tight sm:text-4xl">
            Generated Reports Directory
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d4c49]">
            Access and review clinical reports across all accessions. Each sample generates three specialized reporting formats: Doctor-centric Brief, Patient Guide, and Detailed Scientific Report.
          </p>
        </div>

        {/* Interactive Batch Manager & Accessions Directory */}
        <ReportsBatchManager initialData={sampleData} />
      </main>
    </div>
  );
}
