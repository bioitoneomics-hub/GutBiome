import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { ArrowLeft } from "lucide-react";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";

export const metadata = {
  title: "Microbiome Knowledge Base & Catalog | ONEOMICS MYGUTBIOME",
  description:
    "Curated sentinel gut microbiome species, WHO AMR resistome panel, disease-pattern biomarker models, and functional pathways.",
};

export default function CatalogPage() {
  return (
    <div className="min-h-full pb-16">
      <AppHeader title="Microbiome Species Catalog" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f4f4a] hover:text-[#143834] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Clinical Hub</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mt-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#9a7b3c]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Clinical Knowledge Base
            </span>
            <span className="text-[11px] text-[#7a8885] flex items-center gap-1.5">
              · Reference &amp; Biomarker Models · <MyGutBiomeLogo variant="light" height={15} className="h-3.5 w-auto object-contain inline-block" />
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#143834] tracking-tight sm:text-4xl">
            Microbiome Reference Catalog
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d4c49]">
            Explore the reference taxonomic catalog, antimicrobial resistance (AMR) gene panel,
            clinical disease risk scoring models, and metabolic functional pathways utilized across
            ONEOMICS MYGUTBIOME reports.
          </p>
        </div>

        {/* Interactive Catalog Browser */}
        <CatalogBrowser />
      </main>
    </div>
  );
}
