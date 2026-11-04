import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[var(--paper)] p-8">
      <p className="text-xs tracking-[0.28em] text-[#9a7b3c]">ONEOMICS</p>
      <h1 className="font-serif text-3xl text-[#143834]">Sample not found</h1>
      <p className="text-sm text-[#4d5c59]">The accession may have expired in this demo session.</p>
      <Link href="/" className="text-sm text-[#1f4f4a] underline">
        Return to samples
      </Link>
    </div>
  );
}
