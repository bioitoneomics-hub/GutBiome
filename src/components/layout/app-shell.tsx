"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, UploadCloud } from "lucide-react";
import { LimsSidebar } from "./lims-sidebar";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";

export function AppShell({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("oneomics_lims_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  function handleToggleCollapse() {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("oneomics_lims_collapsed", String(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
{/* Mobile Top Header (only visible on mobile/tablet) */}
      <header className="print:hidden lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1f4f4a]/30 bg-[#102b28] px-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 text-white"
            aria-label="Open clinical navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded bg-white px-2 py-0.5 shadow-xs">
              <Image
                src="/oneomics-logo.png"
                alt="OneOmics"
                width={80}
                height={20}
                className="h-5 w-auto object-contain"
              />
            </div>
            <div className="border-l border-white/20 pl-2 flex items-center">
              <MyGutBiomeLogo variant="dark" height={20} className="h-5 w-auto object-contain" priority />
            </div>
          </Link>
        </div>

        <Link
          href="/upload"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#1f4f4a] px-3 text-xs font-semibold text-white shadow-xs hover:bg-[#143834]"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>Upload</span>
        </Link>
      </header>

      {/* Global LIMS Sidebar */}
      <LimsSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area with dynamic desktop margin matching sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out print:ml-0 print:w-full ${
          isCollapsed ? "lg:ml-20" : "lg:ml-[340px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
