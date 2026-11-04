import Link from "next/link";
import Image from "next/image";

export function AppHeader({
  title,
  printHidden = true,
}: {
  title?: string;
  printHidden?: boolean;
}) {
  return (
    <header
      className={`hidden lg:block h-16 shrink-0 ${
        printHidden
          ? "print:hidden border-b border-[#1f4f4a]/30 bg-[#102b28] text-white"
          : "border-b border-[#1f4f4a]/30 bg-[#102b28] text-white"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 text-xs">
        {/* Left: Clinical Context & Active Module Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center rounded-md bg-white px-2.5 py-1 shadow-xs hover:opacity-90 transition-opacity"
            title="ONEOMICS"
          >
            <Image
              src="/oneomics-logo.png"
              alt="ONEOMICS"
              width={80}
              height={20}
              className="h-5 w-auto object-contain"
              priority
            />
          </Link>
          <span className="text-white/30 text-sm">/</span>
          <span className="text-white/95 font-medium text-sm">
            {title || "Clinical Hub"}
          </span>
        </div>
      </div>
    </header>
  );
}