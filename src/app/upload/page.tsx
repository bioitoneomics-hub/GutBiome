import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BiomUploadForm } from "@/components/biom-upload-form";
import { ArrowLeft, Download, FileSpreadsheet, Layers, ShieldCheck } from "lucide-react";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";

export default function UploadPage() {
  return (
    <div className="min-h-full pb-16">
      <AppHeader title="Metagenomic BIOM Ingestion" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f4f4a] hover:text-[#143834] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard &amp; Samples</span>
          </Link>

          <a
            href="/examples/example-gut.biom"
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f4f4a]/20 bg-white px-2.5 py-1 text-xs font-medium text-[#1f4f4a] hover:bg-[#fbf8f1] transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Benchmark BIOM (2 samples)</span>
          </a>
        </div>

        {/* Page Title & Clinical Subtitle */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#9a7b3c]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Genomic Observation Portal
            </span>
            <span className="text-[11px] text-[#7a8885] flex items-center gap-1.5">
              · Delphina Pipeline · <MyGutBiomeLogo variant="light" height={15} className="h-3.5 w-auto object-contain inline-block" />
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#143834] tracking-tight">
            BIOM Metagenomic Ingestion Portal
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#4d5c59]">
            Import microbial observation matrices from whole-genome shotgun or 16S amplicon pipelines.
            ONEOMICS MYGUTBIOME aligns taxonomy against our 11 disease modules, CARD resistome panel,
            and keystone sentinel models, generating Doctor, Patient, and Detailed scientific reports.
          </p>
        </div>

        {/* Pipeline Step Indicators */}
        <div className="mt-6 grid grid-cols-3 gap-2.5 rounded-2xl border border-[#1f4f4a]/15 bg-white/70 p-3 shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1f4f4a] text-[10px] font-bold text-white">
              1
            </span>
            <div>
              <span className="font-semibold text-[#143834] block">Ingest Matrix</span>
              <span className="text-[10px] text-[#6a7875]">BIOM, TSV, or JSON</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-[#1f4f4a]/15 pl-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1f4f4a] text-[10px] font-bold text-white">
              2
            </span>
            <div>
              <span className="font-semibold text-[#143834] block">Select Sample</span>
              <span className="text-[10px] text-[#6a7875]">Multi-sample support</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-[#1f4f4a]/15 pl-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1f4f4a] text-[10px] font-bold text-white">
              3
            </span>
            <div>
              <span className="font-semibold text-[#143834] block">Generate Suite</span>
              <span className="text-[10px] text-[#6a7875]">3 complete reports</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="mt-6">
          <BiomUploadForm />
        </div>
      </main>
    </div>
  );
}
