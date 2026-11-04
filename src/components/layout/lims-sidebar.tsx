"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeft,
  Search,
  LayoutDashboard,
  UploadCloud,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Dna,
  X,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";
import type { SampleInput } from "@/lib/microbiome/types";

export function LimsSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [samples, setSamples] = useState<SampleInput[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch live samples from API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/samples");
        if (res.ok) {
          const json = await res.json();
          if (json.samples) setSamples(json.samples);
        }
      } catch (err) {
        console.error("Failed to load samples in LIMS sidebar", err);
      }
    }
    void loadData();
  }, [pathname]);

  // Click outside search popover to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered samples for quick accession search
  const filteredSamples = searchQuery.trim()
    ? samples.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
          s.patientCode.toLowerCase().includes(q) ||
          s.accession.toLowerCase().includes(q) ||
          s.displayName.toLowerCase().includes(q) ||
          s.indication.toLowerCase().includes(q)
        );
      })
    : [];

  function handleSelectSample(sampleId: string) {
    setIsSearchOpen(false);
    setSearchQuery("");
    onCloseMobile();
    router.push(`/reports/${sampleId}`);
  }

  const navLinks: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    exact?: boolean;
    external?: boolean;
  }[] = [
    { href: "/", label: "Clinical Hub", icon: LayoutDashboard, exact: true },
    { href: "/reports", label: "Reports & Batch Export", icon: FileSpreadsheet },
    { href: "/upload", label: "Upload BIOM", icon: UploadCloud },
    { href: "/catalog", label: "Microbiome Catalog", icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container: Enlarged to 340px (w-[340px]) on expanded, 80px (w-20) on collapsed */}
      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0f2926] text-white transition-all duration-300 ease-in-out border-r border-[#1f4f4a]/50 shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-[340px]"} w-[340px]`}
      >
        {/* ========================================================================= */}
        {/* 1. BRAND HEADER & COLLAPSE TOGGLE                                         */}
        {/* ========================================================================= */}
        {!isCollapsed ? (
          <div className="h-16 shrink-0 border-b border-[#1f4f4a]/30 px-5 bg-black/15 flex items-center justify-between">
            <Link
              href="/"
              onClick={onCloseMobile}
              className="flex items-center group min-w-0"
            >
              <MyGutBiomeLogo
                variant="dark"
                height={28}
                className="h-7 w-auto object-contain transition group-hover:opacity-90"
                priority
              />
            </Link>

            <div className="flex items-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-16 shrink-0 flex items-center justify-center border-b border-[#1f4f4a]/30 px-2 gap-2">
            <Link
              href="/"
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1 shadow-sm"
              title="MYGUTBIOME"
            >
              <Dna className="h-5 w-5 text-[#143834]" />
            </Link>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. QUICK ACCESSION JUMPER / SEARCH (Enlarged input)                       */}
        {/* ========================================================================= */}
        {!isCollapsed && (
          <div className="px-3.5 pt-3.5 pb-1" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Search patient MRN / accession..."
                className="h-9.5 w-full rounded-xl border border-[#1f4f4a]/60 bg-black/30 pl-9 pr-7 text-xs font-medium text-white placeholder:text-white/45 focus:border-[#c4a35a] focus:outline-none focus:ring-1 focus:ring-[#c4a35a] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-sm"
                >
                  ×
                </button>
              )}

              {/* Live Search Auto-complete Popover */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute left-0 top-full mt-2 w-full rounded-2xl border border-[#1f4f4a] bg-[#143834] p-2 shadow-2xl z-50">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c4a35a]">
                    Matching Cases ({filteredSamples.length})
                  </div>
                  {filteredSamples.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto space-y-1 mt-1">
                      {filteredSamples.slice(0, 6).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSample(s.id)}
                          className="w-full text-left rounded-xl p-2.5 hover:bg-white/10 transition-colors flex items-start justify-between gap-1.5"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white">
                                {s.patientCode}
                              </span>
                              <span className="text-[11px] text-white/70">· {s.displayName}</span>
                            </div>
                            <p className="text-[10px] text-white/60 truncate max-w-[220px] mt-0.5">
                              {s.indication}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-white/40 mt-1 shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-white/60 italic">
                      No matching accession or MRN found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SCROLLABLE NAVIGATION CONTENT (Scrollbar hidden, sleek layout)         */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-3.5 py-2 space-y-3.5">
          {/* Primary Navigation */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider text-[#c4a35a]">
                LIMS Navigation
              </div>
            )}
            {navLinks.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && item.href !== "/";

              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  title={item.label}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0 text-[#c4a35a]" />
                  {!isCollapsed && (
                    <span className="flex items-center gap-1.5">
                      {item.label}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </span>
                  )}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#1f4f4a] text-white shadow-sm font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`h-4.5 w-4.5 shrink-0 ${
                      isActive ? "text-[#c4a35a]" : "text-white/70"
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Recent Accessions History */}
          {!isCollapsed && samples.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider text-[#c4a35a]">
                Recent Accessions
              </div>
              <div className="space-y-0.5">
                {samples.slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    href={`/reports/${s.id}`}
                    onClick={onCloseMobile}
                    className="flex items-center justify-between rounded-xl px-3 py-1.5 text-xs text-white/75 hover:bg-white/10 hover:text-white transition-colors group"
                  >
                    <div className="truncate pr-1.5">
                      <span className="font-mono text-[11px] font-bold text-white/95 group-hover:text-white block">
                        {s.patientCode}
                      </span>
                      <span className="text-[9.5px] text-white/55 truncate block">
                        {s.displayName}
                      </span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-white/35 group-hover:text-white/90 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
