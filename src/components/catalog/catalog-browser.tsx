"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  SPECIES,
  AMR_PANEL,
  DISEASES,
  PATHWAYS,
  PHYLA,
  REFERENCE_DATABASES,
  REFERENCES,
  METHODS_PARAS,
  AGE_MICROBIOME_DYNAMICS,
  type SpeciesDef,
  type AmrDef,
  type DiseaseDef,
  type ReferenceDatabase,
} from "@/lib/microbiome/catalog";
import {
  Search,
  BookOpen,
  ShieldAlert,
  Dna,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Filter,
  Sparkles,
  Database,
  ExternalLink,
  Award,
  FileCheck2,
  Globe2,
  Calculator,
  Sigma,
  Percent,
  Clock,
} from "lucide-react";

export function CatalogBrowser() {
  const [activeTab, setActiveTab] = useState<"species" | "amr" | "diseases" | "pathways" | "sources">("species");

  // Species filters
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [selectedPhylum, setSelectedPhylum] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // AMR filters
  const [amrSearch, setAmrSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  // Disease filters
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pathway filters
  const [pathwaySearch, setPathwaySearch] = useState("");

  // Sources filters
  const [sourceSearch, setSourceSearch] = useState("");

  // Filtered Species
  const filteredSpecies = useMemo(() => {
    return SPECIES.filter((s) => {
      const matchesSearch =
        s.taxon.toLowerCase().includes(speciesSearch.toLowerCase()) ||
        s.family.toLowerCase().includes(speciesSearch.toLowerCase()) ||
        s.notes.toLowerCase().includes(speciesSearch.toLowerCase()) ||
        (s.benefits && s.benefits.toLowerCase().includes(speciesSearch.toLowerCase()));
      const matchesPhylum = selectedPhylum === "all" || s.phylum === selectedPhylum;
      const matchesRole = selectedRole === "all" || s.role === selectedRole;
      return matchesSearch && matchesPhylum && matchesRole;
    });
  }, [speciesSearch, selectedPhylum, selectedRole]);

  // Filtered AMR
  const filteredAmr = useMemo(() => {
    return AMR_PANEL.filter((a) => {
      const matchesSearch =
        a.gene.toLowerCase().includes(amrSearch.toLowerCase()) ||
        a.class.toLowerCase().includes(amrSearch.toLowerCase()) ||
        a.organisms.some((o) => o.toLowerCase().includes(amrSearch.toLowerCase())) ||
        a.interpretation.toLowerCase().includes(amrSearch.toLowerCase()) ||
        a.clinicalNote.toLowerCase().includes(amrSearch.toLowerCase());
      const matchesPriority = selectedPriority === "all" || a.whoPriority === selectedPriority;
      return matchesSearch && matchesPriority;
    });
  }, [amrSearch, selectedPriority]);

  // Unique disease categories
  const diseaseCategories = useMemo(() => {
    return Array.from(new Set(DISEASES.map((d) => d.category)));
  }, []);

  // Filtered Diseases
  const filteredDiseases = useMemo(() => {
    return DISEASES.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(diseaseSearch.toLowerCase()) ||
        d.category.toLowerCase().includes(diseaseSearch.toLowerCase()) ||
        d.evidence.toLowerCase().includes(diseaseSearch.toLowerCase()) ||
        d.clinicianNote.toLowerCase().includes(diseaseSearch.toLowerCase());
      const matchesCat = selectedCategory === "all" || d.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [diseaseSearch, selectedCategory]);

  // Filtered Pathways
  const filteredPathways = useMemo(() => {
    return PATHWAYS.filter((p) =>
      p.name.toLowerCase().includes(pathwaySearch.toLowerCase())
    );
  }, [pathwaySearch]);

  // Filtered Reference Databases & Citations
  const filteredDatabases = useMemo(() => {
    return REFERENCE_DATABASES.filter((db) =>
      db.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      db.authority.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      db.description.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      db.keyUse.toLowerCase().includes(sourceSearch.toLowerCase())
    );
  }, [sourceSearch]);

  const filteredReferences = useMemo(() => {
    return REFERENCES.filter((ref) =>
      ref.toLowerCase().includes(sourceSearch.toLowerCase())
    );
  }, [sourceSearch]);

  const roleBadge = (role: SpeciesDef["role"]) => {
    switch (role) {
      case "beneficial":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "commensal":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "opportunistic":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "pathogen":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleDetails = (role: SpeciesDef["role"]) => {
    switch (role) {
      case "beneficial":
        return {
          badgeLabel: "BENEFICIAL",
          badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300",
          description: "Strengthens gut lining, makes soothing acids (SCFAs), and calms irritation.",
        };
      case "commensal":
        return {
          badgeLabel: "NORMAL",
          badgeStyle: "bg-teal-50 text-teal-800 border-teal-200",
          description: "Natural resident living peacefully in your gut without causing problems.",
        };
      case "opportunistic":
        return {
          badgeLabel: "WATCH",
          badgeStyle: "bg-amber-100 text-amber-800 border-amber-300",
          description: "Harmless in low amounts; watch if levels become elevated.",
        };
      case "pathogen":
        return {
          badgeLabel: "HARMFUL",
          badgeStyle: "bg-rose-100 text-rose-800 border-rose-300",
          description: "Unwanted bacteria capable of causing infections or acute gut upset.",
        };
      default:
        return {
          badgeLabel: String(role).toUpperCase(),
          badgeStyle: "bg-gray-100 text-gray-800 border-gray-300",
          description: "",
        };
    }
  };

  const priorityBadge = (priority: AmrDef["whoPriority"]) => {
    switch (priority) {
      case "critical":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "high":
        return "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
      case "medium":
        return "bg-sky-100 text-sky-800 border-sky-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Catalog Quick Stats Overview (5-Grid) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => setActiveTab("species")}
          className={`rounded-2xl border p-4 text-left transition-all shadow-xs ${
            activeTab === "species"
              ? "border-[#1f4f4a] bg-white ring-2 ring-[#1f4f4a]/20"
              : "border-[#1f4f4a]/15 bg-white/70 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Species Library
            </span>
            <Dna className="h-4 w-4 text-[#1f4f4a]" />
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-[#143834]">
            {SPECIES.length}
          </div>
          <p className="mt-1 text-[11px] text-[#5c6b68]">
            Curated sentinel microbes &amp; reference ranges
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("amr")}
          className={`rounded-2xl border p-4 text-left transition-all shadow-xs ${
            activeTab === "amr"
              ? "border-[#1f4f4a] bg-white ring-2 ring-[#1f4f4a]/20"
              : "border-[#1f4f4a]/15 bg-white/70 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              AMR Resistome
            </span>
            <ShieldAlert className="h-4 w-4 text-rose-700" />
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-[#143834]">
            {AMR_PANEL.length}
          </div>
          <p className="mt-1 text-[11px] text-[#5c6b68]">
            WHO-prioritized resistance determinants
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("diseases")}
          className={`rounded-2xl border p-4 text-left transition-all shadow-xs ${
            activeTab === "diseases"
              ? "border-[#1f4f4a] bg-white ring-2 ring-[#1f4f4a]/20"
              : "border-[#1f4f4a]/15 bg-white/70 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Clinical Modules
            </span>
            <Activity className="h-4 w-4 text-amber-700" />
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-[#143834]">
            {DISEASES.length}
          </div>
          <p className="mt-1 text-[11px] text-[#5c6b68]">
            Evidence-backed disease risk models
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pathways")}
          className={`rounded-2xl border p-4 text-left transition-all shadow-xs ${
            activeTab === "pathways"
              ? "border-[#1f4f4a] bg-white ring-2 ring-[#1f4f4a]/20"
              : "border-[#1f4f4a]/15 bg-white/70 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Metabolic Pathways
            </span>
            <Layers className="h-4 w-4 text-[#1f4f4a]" />
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-[#143834]">
            {PATHWAYS.length}
          </div>
          <p className="mt-1 text-[11px] text-[#5c6b68]">
            SCFA, mucin, and metabolite pathways
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`rounded-2xl border p-4 text-left transition-all shadow-xs ${
            activeTab === "sources"
              ? "border-[#1f4f4a] bg-white ring-2 ring-[#1f4f4a]/20"
              : "border-[#1f4f4a]/15 bg-white/70 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Reference Sources
            </span>
            <BookOpen className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-[#143834]">
            {REFERENCE_DATABASES.length}
          </div>
          <p className="mt-1 text-[11px] text-[#5c6b68]">
            Global databases &amp; peer-reviewed cohorts
          </p>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f4f4a]/15 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white/80 p-1 border border-[#1f4f4a]/15 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("species")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "species"
                ? "bg-[#1f4f4a] text-white shadow-xs"
                : "text-[#3d4c49] hover:bg-[#1f4f4a]/10"
            }`}
          >
            <Dna className="h-3.5 w-3.5" />
            <span>Species Catalog ({SPECIES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("amr")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "amr"
                ? "bg-[#1f4f4a] text-white shadow-xs"
                : "text-[#3d4c49] hover:bg-[#1f4f4a]/10"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>AMR Resistome Panel ({AMR_PANEL.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("diseases")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "diseases"
                ? "bg-[#1f4f4a] text-white shadow-xs"
                : "text-[#3d4c49] hover:bg-[#1f4f4a]/10"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Disease Risk Models ({DISEASES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pathways")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "pathways"
                ? "bg-[#1f4f4a] text-white shadow-xs"
                : "text-[#3d4c49] hover:bg-[#1f4f4a]/10"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Metabolic Pathways ({PATHWAYS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "sources"
                ? "bg-[#1f4f4a] text-white shadow-xs"
                : "text-[#3d4c49] hover:bg-[#1f4f4a]/10"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Reference Sources &amp; Provenance ({REFERENCE_DATABASES.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SPECIES CATALOG                                                    */}
      {/* ========================================================================= */}
      {activeTab === "species" && (
        <div className="space-y-4">
          {/* Reference Provenance Notice */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs text-emerald-950 shadow-2xs">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Reference Origin:</strong> Taxonomy and healthy population baseline ranges are derived from the <strong>NIH Human Microbiome Project (HMP/HMP2)</strong> and <strong>NCBI RefSeq (Release 222)</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("sources")}
              className="text-[11px] font-semibold text-emerald-800 underline hover:text-emerald-950 shrink-0 ml-2"
            >
              View Full Bibliography
            </button>
          </div>

          {/* Quick Plain-English Guide to Ecological Roles */}
          <div className="rounded-xl border border-[#1f4f4a]/15 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#143834]">
                <Info className="h-4 w-4 text-[#1f4f4a]" />
                <span>Plain-English Guide: What Do These Bacteria Roles Mean?</span>
              </div>
              <span className="text-[10px] text-[#6a7875]">Simple Layman Clarifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              {/* Beneficial */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="rounded bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                    Beneficial
                  </span>
                </div>
                <p className="text-[10.5px] text-[#2d4c45] leading-snug">
                  Actively protects your gut lining, produces soothing acids (SCFAs) and vitamins, and calms digestive inflammation.
                </p>
              </div>

              {/* Normal */}
              <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="rounded bg-teal-50 border border-teal-200 px-2 py-0.5 text-[9px] font-bold uppercase text-teal-800">
                    Normal
                  </span>
                </div>
                <p className="text-[10.5px] text-[#2d4c45] leading-snug">
                  Natural everyday residents living peacefully in your digestive tract without causing symptoms.
                </p>
              </div>

              {/* Watch */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                    Watch
                  </span>
                </div>
                <p className="text-[10.5px] text-[#4d4029] leading-snug">
                  Safe in ordinary small amounts, but should be watched if levels become elevated or friendly flora drop.
                </p>
              </div>

              {/* Harmful */}
              <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="rounded bg-rose-100 border border-rose-300 px-2 py-0.5 text-[9px] font-bold uppercase text-rose-800">
                    Harmful
                  </span>
                </div>
                <p className="text-[10.5px] text-[#4d2d2d] leading-snug">
                  Unwanted bacteria that clinicians monitor closely to prevent acute enteric infections and dysbiosis.
                </p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1f4f4a]/15 bg-white p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8885]" />
              <input
                type="text"
                placeholder="Search species by Latin name, family, notes, or benefits..."
                value={speciesSearch}
                onChange={(e) => setSpeciesSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1f4f4a]/20 bg-[#fbf8f1]/50 py-1.5 pl-9 pr-3 text-xs text-[#143834] placeholder:text-[#7a8885] focus:border-[#1f4f4a] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#5c6b68]">
                <Filter className="h-3.5 w-3.5" />
                <span>Role:</span>
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                aria-label="Filter species by ecological role"
                className="rounded-lg border border-[#1f4f4a]/20 bg-white px-2.5 py-1.5 text-xs font-medium text-[#143834] focus:border-[#1f4f4a] focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="beneficial">Beneficial</option>
                <option value="commensal">Normal</option>
                <option value="opportunistic">Watch</option>
                <option value="pathogen">Harmful</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-[#5c6b68] ml-2">
                <span>Phylum:</span>
              </div>
              <select
                value={selectedPhylum}
                onChange={(e) => setSelectedPhylum(e.target.value)}
                aria-label="Filter species by phylum"
                className="rounded-lg border border-[#1f4f4a]/20 bg-white px-2.5 py-1.5 text-xs font-medium text-[#143834] focus:border-[#1f4f4a] focus:outline-none"
              >
                <option value="all">All Phyla</option>
                {PHYLA.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Species Table */}
          <div className="rounded-2xl border border-[#1f4f4a]/20 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#1f4f4a]/15 bg-[#fbf8f1] font-bold text-[#143834] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Taxon / Organism</th>
                    <th className="px-4 py-3">Phylum &amp; Family</th>
                    <th className="px-4 py-3">
                      <div>Ecological Role</div>
                      <div className="text-[8.5px] font-normal lowercase tracking-normal text-[#6a7875]">plain meaning &amp; status</div>
                    </th>
                    <th className="px-4 py-3">Healthy Ref Range</th>
                    <th className="px-4 py-3">Clinical Context &amp; Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f4f4a]/10">
                  {filteredSpecies.map((s) => (
                    <tr key={s.taxon} className="hover:bg-[#1f4f4a]/5 transition-colors">
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-serif italic font-bold text-[13px] text-[#143834]">
                          {s.taxon}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-medium text-[#143834]">{s.phylum}</div>
                        <div className="text-[11px] text-[#7a8885]">{s.family}</div>
                      </td>
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        {(() => {
                          const info = getRoleDetails(s.role);
                          return (
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`inline-block rounded px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border ${info.badgeStyle}`}
                              >
                                {info.badgeLabel}
                              </span>
                              <span className="text-[9.5px] text-[#5c6b68] leading-tight block max-w-[190px] whitespace-normal">
                                {info.description}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-[#143834]">
                          {s.ref[0]}% – {s.ref[1]}%
                        </span>
                        <span className="text-[10px] text-[#7a8885] block">relative ab.</span>
                      </td>
                      <td className="px-4 py-3.5 align-top text-[#3d4c49] leading-relaxed">
                        <div>{s.notes}</div>
                        {s.benefits && (
                          <div className="mt-1 flex items-start gap-1 text-[11px] text-emerald-800 font-medium">
                            <Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-emerald-600" />
                            <span>{s.benefits}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredSpecies.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#7a8885]">
                        No species found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AMR RESISTOME PANEL                                                */}
      {/* ========================================================================= */}
      {activeTab === "amr" && (
        <div className="space-y-4">
          {/* Reference Provenance Notice */}
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2 text-xs text-rose-950 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-700 shrink-0" />
              <span>
                <strong>Reference Origin:</strong> Resistance genes and risk stratifications are curated from the <strong>Comprehensive Antibiotic Resistance Database (CARD 3.2.9)</strong> and the <strong>WHO Bacterial Priority Pathogens List (BPPL 2024)</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("sources")}
              className="text-[11px] font-semibold text-rose-800 underline hover:text-rose-950 shrink-0 ml-2"
            >
              View AMR Documentation
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1f4f4a]/15 bg-white p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8885]" />
              <input
                type="text"
                placeholder="Search AMR genes (e.g. blaNDM, vanA, qnrS), drug classes, or host organisms..."
                value={amrSearch}
                onChange={(e) => setAmrSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1f4f4a]/20 bg-[#fbf8f1]/50 py-1.5 pl-9 pr-3 text-xs text-[#143834] placeholder:text-[#7a8885] focus:border-[#1f4f4a] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5c6b68]">WHO Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                aria-label="Filter AMR genes by WHO priority"
                className="rounded-lg border border-[#1f4f4a]/20 bg-white px-2.5 py-1.5 text-xs font-medium text-[#143834] focus:border-[#1f4f4a] focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical Priority (e.g. NDM, KPC)</option>
                <option value="high">High Priority (e.g. vanA, gyrA)</option>
                <option value="medium">Medium Priority</option>
              </select>
            </div>
          </div>

          {/* AMR Grid Cards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredAmr.map((a) => (
              <div
                key={a.gene}
                className="rounded-2xl border border-[#1f4f4a]/15 bg-white p-4 shadow-xs transition-all hover:border-[#1f4f4a]/30"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#1f4f4a]/10 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-[#143834]">{a.gene}</span>
                      <span className="text-xs text-[#7a8885]">({a.class})</span>
                    </div>
                    <p className="text-[11px] text-[#5c6b68] mt-0.5">
                      Carrier Hosts: <span className="italic font-medium">{a.organisms.join(", ")}</span>
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[9px] uppercase tracking-wider border ${priorityBadge(
                      a.whoPriority
                    )}`}
                  >
                    {a.whoPriority} Priority
                  </span>
                </div>

                <div className="mt-2.5 text-xs leading-relaxed text-[#3d4c49]">
                  <p>
                    <strong className="text-[#143834]">Mechanism &amp; Meaning:</strong> {a.interpretation}
                  </p>
                </div>

                <div className="mt-2.5 rounded-lg border border-[#1f4f4a]/12 bg-[#fbf8f1] p-2 text-[11px] text-[#2c3d39] leading-snug">
                  <span className="font-bold text-[#143834]">Prescribing Guidance:</span> {a.clinicalNote}
                </div>
              </div>
            ))}
            {filteredAmr.length === 0 && (
              <div className="col-span-2 rounded-2xl border border-[#1f4f4a]/15 bg-white p-8 text-center text-[#7a8885]">
                No antibiotic resistance determinants found matching the search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLINICAL DISEASE RISK MODELS                                       */}
      {/* ========================================================================= */}
      {activeTab === "diseases" && (
        <div className="space-y-4">
          {/* Reference Provenance Notice */}
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-xs text-amber-950 shadow-2xs">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-700 shrink-0" />
              <span>
                <strong>Reference Origin:</strong> Clinical disease risk algorithms are calibrated against published metagenomic cohorts from <strong>MetaHIT</strong>, <strong>IBDMDB (HMP2)</strong>, and peer-reviewed studies in <strong>Nature</strong> and <strong>Cell</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("sources")}
              className="text-[11px] font-semibold text-amber-800 underline hover:text-amber-950 shrink-0 ml-2"
            >
              View Research Citations
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1f4f4a]/15 bg-white p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8885]" />
              <input
                type="text"
                placeholder="Search disease models (e.g., IBD, IBS, NAFLD, SIBO, Parkinson)..."
                value={diseaseSearch}
                onChange={(e) => setDiseaseSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1f4f4a]/20 bg-[#fbf8f1]/50 py-1.5 pl-9 pr-3 text-xs text-[#143834] placeholder:text-[#7a8885] focus:border-[#1f4f4a] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5c6b68]">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter disease models by category"
                className="rounded-lg border border-[#1f4f4a]/20 bg-white px-2.5 py-1.5 text-xs font-medium text-[#143834] focus:border-[#1f4f4a] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {diseaseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Disease Cards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredDiseases.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-[#1f4f4a]/15 bg-white p-4.5 shadow-xs transition-all hover:border-[#1f4f4a]/30"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#1f4f4a]/10 pb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                      {d.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#143834] leading-tight mt-0.5">
                      {d.name}
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-[#7a8885] bg-[#1f4f4a]/5 px-2 py-0.5 rounded">
                    MOD-{d.id.toUpperCase()}
                  </span>
                </div>

                <div className="mt-2.5 text-xs text-[#3d4c49]">
                  <p className="leading-snug">
                    <span className="font-semibold text-[#143834]">Evidence Basis:</span>{" "}
                    {d.evidence}
                  </p>
                </div>

                <div className="mt-3 rounded-lg border border-[#1f4f4a]/15 bg-[#fbf8f1] p-2.5 text-[11px] text-[#2c3d39] leading-snug">
                  <span className="font-bold text-[#143834]">Clinician Directive:</span>{" "}
                  {d.clinicianNote}
                </div>

                <div className="mt-2 text-[10.5px] italic text-[#5c6b68] leading-tight">
                  <span className="font-semibold not-italic text-[#7a8885]">Patient note:</span>{" "}
                  {d.patientNote}
                </div>
              </div>
            ))}
            {filteredDiseases.length === 0 && (
              <div className="col-span-2 rounded-2xl border border-[#1f4f4a]/15 bg-white p-8 text-center text-[#7a8885]">
                No disease models found matching the search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: METABOLIC FUNCTIONAL PATHWAYS                                      */}
      {/* ========================================================================= */}
      {activeTab === "pathways" && (
        <div className="space-y-4">
          {/* Reference Provenance Notice */}
          <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs text-blue-950 shadow-2xs">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-700 shrink-0" />
              <span>
                <strong>Reference Origin:</strong> Metabolic functional pathways and enzyme orthologs are mapped against <strong>MetaCyc (v27.5)</strong> and <strong>KEGG Orthology (Kyoto Encyclopedia of Genes and Genomes)</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("sources")}
              className="text-[11px] font-semibold text-blue-800 underline hover:text-blue-950 shrink-0 ml-2"
            >
              View Pathway References
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1f4f4a]/15 bg-white p-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8885]" />
              <input
                type="text"
                placeholder="Search metabolic pathways (e.g., butyrate, bile, tryptophan, mucin)..."
                value={pathwaySearch}
                onChange={(e) => setPathwaySearch(e.target.value)}
                className="w-full rounded-lg border border-[#1f4f4a]/20 bg-[#fbf8f1]/50 py-1.5 pl-9 pr-3 text-xs text-[#143834] placeholder:text-[#7a8885] focus:border-[#1f4f4a] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Pathways Table */}
          <div className="rounded-2xl border border-[#1f4f4a]/20 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#1f4f4a]/15 bg-[#fbf8f1] font-bold text-[#143834] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Metabolic Functional Pathway</th>
                    <th className="px-4 py-3">Expected Reference Level</th>
                    <th className="px-4 py-3">Biological Role in Gut Ecology</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f4f4a]/10">
                  {filteredPathways.map((p) => (
                    <tr key={p.name} className="hover:bg-[#1f4f4a]/5 transition-colors">
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-semibold text-[13px] text-[#143834]">
                          {p.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#1f4f4a] h-2 rounded-full"
                              style={{ width: `${Math.round(p.expected * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#143834]">
                            {Math.round(p.expected * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-[#3d4c49]">
                        {p.name.includes("Butyrate") &&
                          "Primary colonocyte energy source; exerts potent anti-inflammatory barrier effects."}
                        {p.name.includes("Propionate") &&
                          "Absorbed via portal vein to regulate hepatic gluconeogenesis and satiety."}
                        {p.name.includes("Acetate") &&
                          "Most abundant SCFA; cross-feeds butyrate producers and supports peripheral tissues."}
                        {p.name.includes("Bile") &&
                          "Deconjugation and conversion of primary to secondary bile acids influencing FXR/TGR5."}
                        {p.name.includes("Tryptophan") &&
                          "Microbial conversion to AhR ligands (IPA, indole) maintaining mucosal integrity."}
                        {p.name.includes("Mucin") &&
                          "Turnover of gut glycans; required for healthy mucosal layer renewal."}
                        {p.name.includes("Vitamin") || p.name.includes("Folate") || p.name.includes("Riboflavin")
                          ? "Endogenous biosynthesis of essential B-complex micronutrients."
                          : null}
                        {p.name.includes("Hydrogen sulphide") &&
                          "End-product of sulphate-reducing bacteria; excessive levels may impair colonocyte respiration."}
                        {p.name.includes("Trimethylamine") &&
                          "Conversion of choline/carnitine to TMA, substrate for hepatic TMAO conversion."}
                        {p.name.includes("pks") &&
                          "Genotoxic colibactin island associated with DNA double-strand breaks."}
                        {p.name.includes("Beta-glucuronidase") &&
                          "Deconjugates xenobiotics and estrogens in the colonic lumen."}
                        {p.name.includes("starch") || p.name.includes("Inulin") || p.name.includes("Xylan")
                          ? "Carbohydrate-active enzyme (CAZyme) complex digesting prebiotic fibers."
                          : null}
                      </td>
                    </tr>
                  ))}
                  {filteredPathways.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-[#7a8885]">
                        No metabolic pathways found matching the search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: REFERENCE SOURCES & PROVENANCE                                     */}
      {/* ========================================================================= */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          {/* Header Description Card */}
          <div className="rounded-2xl border border-[#1f4f4a]/20 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Award className="h-5 w-5 text-[#9a7b3c]" />
              <h2 className="font-serif text-xl font-bold text-[#143834]">
                Scientific Data Provenance &amp; Reference Standards
              </h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#3d4c49]">
              Every reference range, AMR gene definition, and clinical disease association model in the ONEOMICS MYGUTBIOME platform is directly traceable to globally recognized bioinformatics repositories and peer-reviewed clinical metagenomic cohorts.
            </p>

            {/* Quality Standard Badges */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-2.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#9a7b3c] block">Clinical Spec</span>
                <span className="font-bold text-[#143834]">ISO 15189:2022</span>
                <p className="text-[10px] text-[#6a7875] mt-0.5">Medical laboratory testing standard</p>
              </div>
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-2.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#9a7b3c] block">AMR Catalog</span>
                <span className="font-bold text-[#143834]">CARD 3.2.9 / WHO</span>
                <p className="text-[10px] text-[#6a7875] mt-0.5">Curated resistome ontology</p>
              </div>
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-2.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#9a7b3c] block">Taxonomy Standard</span>
                <span className="font-bold text-[#143834]">NCBI RefSeq &amp; GTDB</span>
                <p className="text-[10px] text-[#6a7875] mt-0.5">Genomic phylogenetic reference</p>
              </div>
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-2.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#9a7b3c] block">Sequencing QC</span>
                <span className="font-bold text-[#143834]">Mean Q30 &ge; 80%</span>
                <p className="text-[10px] text-[#6a7875] mt-0.5">Host DNA depleted &lt; 10%</p>
              </div>
            </div>
          </div>

          {/* Section 1: Curated Reference Databases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
                <Database className="h-4 w-4 text-[#1f4f4a]" />
                Primary Reference Databases &amp; Repositories
              </h3>
              <span className="text-[11px] text-[#6a7875]">6 Official Standards</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDatabases.map((db) => (
                <div
                  key={db.name}
                  className="rounded-2xl border border-[#1f4f4a]/15 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-[#1f4f4a]/10 pb-2">
                    <div>
                      <span className="rounded bg-[#1f4f4a]/8 px-1.5 py-0.2 text-[8.5px] font-bold uppercase tracking-wider text-[#1f4f4a]">
                        {db.category}
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#143834] mt-1 leading-tight">
                        {db.name}
                      </h4>
                      <p className="text-[10.5px] text-[#7a8885] mt-0.5">{db.authority}</p>
                    </div>
                    <span className="font-mono text-[9px] font-semibold text-[#9a7b3c] bg-[#faf8f2] border border-[#9a7b3c]/20 px-2 py-0.5 rounded shrink-0">
                      {db.version}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#4d5c59] leading-relaxed">
                    {db.description}
                  </p>

                  <div className="mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-[11px] text-emerald-950">
                    <strong className="text-emerald-900">Application in MYGUTBIOME:</strong> {db.keyUse}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Biostatistical Calculation Methodology & Value Provenance */}
          <div className="rounded-2xl border border-[#1f4f4a]/20 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-[#1f4f4a]" />
                  Biostatistical Calculation Methodology &amp; Mathematical Provenance
                </h3>
                <p className="text-[11px] text-[#5c6b68] mt-0.5">
                  Exact mathematical formulas, weighting coefficients, percentile thresholds, and cohort calibration standards
                </p>
              </div>
              <span className="font-mono text-[9px] font-semibold text-[#1f4f4a] bg-[#1f4f4a]/8 border border-[#1f4f4a]/15 px-2 py-0.5 rounded shrink-0">
                Validated Biostatistics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. Gut Integrity Score */}
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1.5">
                    <span className="text-[11px] font-bold text-[#143834] flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-[#9a7b3c]" />
                      1. Overall Gut Integrity Score (0–100)
                    </span>
                    <span className="font-mono text-[8px] font-semibold text-[#6a7875] bg-white border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                      Multi-Domain Index
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg bg-white border border-[#1f4f4a]/10 p-2 font-mono text-[10px] text-[#143834] leading-relaxed overflow-x-auto">
                    <strong>Formula:</strong> Gut Score = clamp(w<sub>diversity</sub> &times; 40 + (1 &minus; w<sub>inflammation</sub>) &times; 25 + (1 &minus; w<sub>amrLoad</sub>) &times; 20 + w<sub>fiber</sub> &times; 15)
                  </div>

                  <div className="mt-2 space-y-1 text-[10px] text-[#4d5c59] leading-snug">
                    <p><strong>Sub-Domain Weights &amp; Calculations:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><strong>40% Community Diversity (w<sub>diversity</sub>):</strong> Normalized Shannon index (H&prime; &minus; 1.2) / 2.6 clamped to [0, 1].</li>
                      <li><strong>25% Mucosal Protection (1 &minus; w<sub>inflammation</sub>):</strong> Inverse penalty for blooms of <em>Ruminococcus gnavus</em>, Enterobacteriaceae, and harmful bacteria.</li>
                      <li><strong>20% Resistome Safety (1 &minus; w<sub>amrLoad</sub>):</strong> Deducts points for genomic carriage of WHO-priority AMR determinants and pathogen load.</li>
                      <li><strong>15% SCFA Synthesis Potential (w<sub>fiber</sub>):</strong> Cumulative abundance of primary butyrate and acetate producers (<em>Faecalibacterium</em>, <em>Roseburia</em>, <em>Eubacterium</em>, <em>Bifidobacterium</em>).</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1f4f4a]/10 text-[9px] text-[#5c6b68] flex items-center justify-between">
                  <span><strong>Reference Norm:</strong> &ge; 70 Eubiotic &middot; 40–69 Moderate &middot; &lt;40 Marked</span>
                  <span className="italic">NIH HMP &amp; MetaHIT Baseline</span>
                </div>
              </div>

              {/* 2. Shannon Diversity Index */}
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1.5">
                    <span className="text-[11px] font-bold text-[#143834] flex items-center gap-1.5">
                      <Sigma className="h-3.5 w-3.5 text-[#1f4f4a]" />
                      2. Shannon Diversity Index (H&prime;)
                    </span>
                    <span className="font-mono text-[8px] font-semibold text-[#6a7875] bg-white border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                      Ecological Entropy
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg bg-white border border-[#1f4f4a]/10 p-2 font-mono text-[10px] text-[#143834] leading-relaxed overflow-x-auto">
                    <strong>Formula:</strong> H&prime; = &minus; &sum; (p<sub>i</sub> &times; ln(p<sub>i</sub>)), &nbsp; where p<sub>i</sub> = Relative Abundance<sub>i</sub> / 100
                  </div>

                  <div className="mt-2 space-y-1 text-[10px] text-[#4d5c59] leading-snug">
                    <p><strong>Calculation &amp; Biological Interpretation:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><strong>Species Richness (S):</strong> Total number of distinct active bacterial taxa identified by whole-genome shotgun sequencing or feature tables.</li>
                      <li><strong>Evenness (Pielou&apos;s J):</strong> Equitability of taxon distribution across the microbial ecosystem.</li>
                      <li><strong>Clinical Meaning:</strong> Values &gt; 3.5 indicate high functional redundancy and resilience against digestive disturbances; values &lt; 3.2 signal ecological narrowing (common post-antibiotics or low-fiber diets).</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1f4f4a]/10 text-[9px] text-[#5c6b68] flex items-center justify-between">
                  <span><strong>Healthy Adult Reference:</strong> 3.2 – 4.6 (Shannon H&prime;)</span>
                  <span className="italic">NIH HMP Cohort (Nature 2012)</span>
                </div>
              </div>

              {/* 3. Relative Abundance & Reference Intervals */}
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1.5">
                    <span className="text-[11px] font-bold text-[#143834] flex items-center gap-1.5">
                      <Percent className="h-3.5 w-3.5 text-[#9a7b3c]" />
                      3. Relative Abundance &amp; Reference Percentiles
                    </span>
                    <span className="font-mono text-[8px] font-semibold text-[#6a7875] bg-white border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                      10th–90th &amp; 95th %ile
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg bg-white border border-[#1f4f4a]/10 p-2 font-mono text-[10px] text-[#143834] leading-relaxed overflow-x-auto">
                    <strong>Formula:</strong> Relative Abundance<sub>i</sub> (%) = (Counts<sub>i</sub> / Total Microbial Counts) &times; 100
                  </div>

                  <div className="mt-2 space-y-1 text-[10px] text-[#4d5c59] leading-snug">
                    <p><strong>How Reference Limits are Established:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><strong>Beneficial Sentinel Microbes:</strong> Healthy target windows represent the <strong>10th percentile (minimum threshold)</strong> to <strong>90th percentile (upper threshold)</strong> of healthy adults in the NIH HMP and MetaHIT datasets (e.g. <em>F. prausnitzii</em> min 3.0%, <em>A. muciniphila</em> min 0.5%).</li>
                      <li><strong>Watchlist Microbes:</strong> The upper reference threshold represents the <strong>95th percentile upper limit</strong> of asymptomatic healthy population carriers. Trace levels (&le; upper limit) represent normal, harmless resident bacteria; levels exceeding the limit flag overgrowth.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1f4f4a]/10 text-[9px] text-[#5c6b68] flex items-center justify-between">
                  <span><strong>Population Cohorts:</strong> NIH HMP (300+ healthy donors) &middot; MetaHIT</span>
                  <span className="italic">ISO 15189 Calibrated</span>
                </div>
              </div>

              {/* 4. Disease Risk Models */}
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1.5">
                    <span className="text-[11px] font-bold text-[#143834] flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-amber-700" />
                      4. 11 Clinical Disease Risk Models (0–100)
                    </span>
                    <span className="font-mono text-[8px] font-semibold text-[#6a7875] bg-white border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                      Cohort Calibration
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg bg-white border border-[#1f4f4a]/10 p-2 font-mono text-[10px] text-[#143834] leading-relaxed overflow-x-auto">
                    <strong>Model:</strong> Score = clamp(&sum; w<sub>k</sub> &times; DriverTaxa<sub>k</sub> &minus; &sum; v<sub>m</sub> &times; SentinelTaxa<sub>m</sub> + BaseOffset)
                  </div>

                  <div className="mt-2 space-y-1 text-[10px] text-[#4d5c59] leading-snug">
                    <p><strong>Published Cohort Reference Calibrations:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><strong>IBD (CD/UC):</strong> IBDMDB (Nature 2019) &amp; MetaHIT (Nature 2014) &mdash; driven by <em>R. gnavus</em> &times; 8 + <em>E. coli</em> &times; 6 &minus; <em>F. prausnitzii</em> &times; 4.</li>
                      <li><strong>Digestive Sensitivity (IBS):</strong> Rome IV Cohort references &mdash; driven by methanogen &amp; fermentation dynamics.</li>
                      <li><strong>Cardiometabolic &amp; T2D:</strong> Qin et al. (Nature 2012) &mdash; driven by <em>Akkermansia</em> depletion + low diversity + bile taxa.</li>
                      <li><strong>C. difficile Vulnerability:</strong> Buffie et al. (Nature 2015) &mdash; precision reconstitution model.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1f4f4a]/10 text-[9px] text-[#5c6b68] flex items-center justify-between">
                  <span><strong>Interpretation Scale:</strong> 0–40 Typical &middot; 41–70 Borderline &middot; 71–100 Elevated</span>
                  <span className="italic">Peer-Reviewed Case-Controls</span>
                </div>
              </div>

              {/* 5. AMR Resistome Classification */}
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1.5">
                    <span className="text-[11px] font-bold text-[#143834] flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-700" />
                      5. AMR Resistome Triage &amp; Coverage
                    </span>
                    <span className="font-mono text-[8px] font-semibold text-[#6a7875] bg-white border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                      CARD / WHO BPPL
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg bg-white border border-[#1f4f4a]/10 p-2 font-mono text-[10px] text-[#143834] leading-relaxed overflow-x-auto">
                    <strong>Criteria:</strong> Align to CARD 3.2.9 ARO Ontology &middot; Coverage &ge; 80% &middot; Read Depth &ge; 40 reads
                  </div>

                  <div className="mt-2 space-y-1 text-[10px] text-[#4d5c59] leading-snug">
                    <p><strong>WHO Priority Stratification &amp; Clinical Meaning:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><strong>Critical Priority:</strong> Carbapenem resistance (blaNDM, blaKPC, blaOXA-48) and colistin resistance (mcr-1).</li>
                      <li><strong>High Priority:</strong> Vancomycin resistance (vanA, vanB) and fluoroquinolone target mutations.</li>
                      <li><strong>Stewardship Directive:</strong> Asymptomatic carriage is peaceful colonization, not active infection. Confirmatory phenotypic AST required prior to targeted therapy.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1f4f4a]/10 text-[9px] text-[#5c6b68] flex items-center justify-between">
                  <span><strong>Standards:</strong> CARD 3.2.9 &middot; WHO BPPL (2024 Revision)</span>
                  <span className="italic">Global Resistance Ontology</span>
                </div>
              </div>

              {/* 6. Ecological Ratios & Metabolic Pathways */}
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1.5">
                    <span className="text-[11px] font-bold text-[#143834] flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[#1f4f4a]" />
                      6. Ecological Ratios &amp; Metabolic Completeness
                    </span>
                    <span className="font-mono text-[8px] font-semibold text-[#6a7875] bg-white border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded">
                      F/B Ratio &middot; MetaCyc
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg bg-white border border-[#1f4f4a]/10 p-2 font-mono text-[10px] text-[#143834] leading-relaxed overflow-x-auto">
                    <strong>F/B Ratio:</strong> % Firmicutes / % Bacteroidota &nbsp; (Healthy Omnivorous Adult Ref: 1.5 – 3.5)
                  </div>

                  <div className="mt-2 space-y-1 text-[10px] text-[#4d5c59] leading-snug">
                    <p><strong>Metabolic Pathway Functional Potential:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><strong>Pathway Completeness (0.0–1.0):</strong> Mapped against MetaCyc v27.5 and KEGG Orthology. Index evaluates enzymatic capacity relative to expected healthy adult baseline (1.0 = 100%).</li>
                      <li><strong>Key Monitored Pathways:</strong> Butyrate synthesis (acetyl-CoA &amp; 4-aminobutyrate pathways), Propionate, Acetate, Bile salt hydrolase, Tryptophan-to-IPA, and Vitamin B-complex biosynthesis.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1f4f4a]/10 text-[9px] text-[#5c6b68] flex items-center justify-between">
                  <span><strong>Pathway Catalogs:</strong> MetaCyc 27.5 &middot; KEGG Orthology (KO)</span>
                  <span className="italic">Biochemical Enzymology</span>
                </div>
              </div>

              {/* 7. Gut Microbiome Health Index (GMHI via q2-health-index) */}
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-3.5 flex flex-col justify-between md:col-span-2">
                <div>
                  <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-1.5">
                    <span className="text-[11px] font-bold text-[#143834] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                      7. Gut Microbiome Health Index (GMHI) &amp; QIIME 2 Plugin (q2-health-index)
                    </span>
                    <span className="font-mono text-[8px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      Gupta et al. Nature Comm 2020
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg bg-white border border-[#1f4f4a]/10 p-2 font-mono text-[10px] text-[#143834] leading-relaxed overflow-x-auto">
                    <strong>Formula:</strong> GMHI = log<sub>10</sub> &thinsp; [ (&psi;<sub>MH</sub> + 10<sup>&minus;5</sup>) / (&psi;<sub>MN</sub> + 10<sup>&minus;5</sup>) ] &emsp;
                    where &nbsp; &psi;<sub>MH</sub> = (R<sub>MH</sub> / 7) &times; H<sub>MH</sub> &emsp; and &emsp; &psi;<sub>MN</sub> = (R<sub>MN</sub> / 31) &times; H<sub>MN</sub>
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-[#4d5c59] leading-snug">
                    <div className="space-y-1">
                      <p><strong>Variables &amp; Group Formulation:</strong></p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li><strong>R<sub>MH</sub> / R<sub>MN</sub> (Richness):</strong> Count of non-zero health-prevalent (MH) and health-scarce (MN) indicator species detected in the sample.</li>
                        <li><strong>H<sub>MH</sub> / H<sub>MN</sub> (Shannon Diversity):</strong> Entropy index &minus;&sum; p<sub>i</sub> &times; ln(p<sub>i</sub>) computed across each indicator subgroup.</li>
                        <li><strong>Normalization Constants:</strong> 7 health-prevalent species denominator; 31 health-scarce species denominator; 10<sup>&minus;5</sup> pseudocount floor preventing zero-division.</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p><strong>Clinical Cohort Proof &amp; Classification:</strong></p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li><strong>GMHI &gt; 0 (Healthy-Like):</strong> Collective prevalence and diversity of beneficial sentinel taxa outweigh disease-associated species.</li>
                        <li><strong>GMHI &lt; 0 (Non-Healthy / Dysbiotic):</strong> Shift towards pathobiont dominance observed across 12 clinical disease phenotypes.</li>
                        <li><strong>Meta-Analysis Scope:</strong> Trained on 4,347 human stool metagenomes across 34 multicenter published studies distinguishing healthy controls from inflammatory bowel diseases, CRC, and metabolic disorders.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1f4f4a]/10 text-[9px] text-[#5c6b68] flex items-center justify-between">
                  <span><strong>Repository &amp; Algorithm:</strong> q2-health-index (QIIME 2 Community Plugin) &middot; Gupta VK et al. Nature Communications (2020)</span>
                  <span className="italic font-medium text-emerald-800">4,347 Stool Metagenomes Calibrated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Age-Stratified Microbiome Dynamics & Gut Score Determination */}
          <div className="rounded-2xl border border-[#1f4f4a]/20 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#1f4f4a]" />
                  Age-Stratified Microbiome Dynamics &amp; Gut Score Determination
                </h3>
                <p className="text-[11px] text-[#5c6b68] mt-0.5">
                  How microbial diversity, community stability, and Gut Score determinations shift from infancy to advanced age across clinical reference cohorts
                </p>
              </div>
              <span className="font-mono text-[9px] font-semibold text-[#9a7b3c] bg-[#faf8f2] border border-[#1f4f4a]/15 px-2 py-0.5 rounded shrink-0">
                4 Life Stages &middot; Cohort Calibrated
              </span>
            </div>

            <div className="space-y-4">
              {AGE_MICROBIOME_DYNAMICS.map((stage) => (
                <div
                  key={stage.stage}
                  className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-4 flex flex-col justify-between space-y-3"
                >
                  {/* Stage Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f4f4a]/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#1f4f4a] text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        {stage.ageBracket}
                      </span>
                      <h4 className="text-xs font-bold text-[#143834]">{stage.stage}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-[#6a7875]">Expected Shannon Entropy:</span>
                      <span className="font-mono font-bold text-[#143834] bg-white border border-[#1f4f4a]/12 px-2 py-0.5 rounded">
                        {stage.shannonBaseline}
                      </span>
                    </div>
                  </div>

                  {/* Summary & Gut Score Calibration Context */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10.5px] leading-snug">
                    <div className="rounded-lg bg-white border border-[#1f4f4a]/10 p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#143834] block mb-1">
                        Ecological &amp; Community Dynamics
                      </span>
                      <p className="text-[#4d5c59]">{stage.summary}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-[#1f4f4a]/10 p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#9a7b3c] block mb-1">
                        Gut Score Determination &amp; Calibration
                      </span>
                      <p className="text-[#4d5c59]">{stage.gutScoreImpact}</p>
                    </div>
                  </div>

                  {/* Cohort Citation */}
                  <div className="pt-2 border-t border-[#1f4f4a]/10 text-[8.5px] text-[#6a7875] flex items-center justify-between">
                    <span>
                      <strong className="text-[#143834]">Peer-Reviewed Cohort Standard:</strong> {stage.cohortCitation}
                    </span>
                    <span className="font-mono text-[7.5px] text-[#1f4f4a] bg-white border border-[#1f4f4a]/10 px-1.5 py-0.2 rounded font-semibold">
                      Age-Specific Calibration
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Peer-Reviewed Scientific Bibliography */}
          <div className="rounded-2xl border border-[#1f4f4a]/20 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#9a7b3c]" />
                Peer-Reviewed Clinical Literature &amp; Research Citations ({REFERENCES.length})
              </h3>
              <span className="text-[10px] text-[#6a7875]">Nature &middot; Science &middot; Cell &middot; PNAS</span>
            </div>

            <ol className="space-y-2 text-xs text-[#3d4c49] list-decimal pl-4 leading-relaxed">
              {filteredReferences.map((ref, idx) => (
                <li key={idx} className="pl-1">
                  <span className="text-[#143834] font-medium">{ref}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Section 3: Analytical Laboratory Protocol Summary */}
          <div className="rounded-2xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-4.5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#143834] flex items-center gap-1.5 mb-2">
              <FileCheck2 className="h-4 w-4 text-[#1f4f4a]" />
              Laboratory Sequencing &amp; QC Verification Protocol
            </h3>
            <div className="space-y-1.5 text-xs text-[#4d5c59] leading-relaxed">
              {METHODS_PARAS.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
