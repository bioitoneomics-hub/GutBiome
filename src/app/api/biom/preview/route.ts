import { NextResponse } from "next/server";
import { BiomParseError, parseBiomFile } from "@/lib/microbiome/biom";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a BIOM or OTU table file." }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File is larger than 50 MB." }, { status: 413 });
  }
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const parsed = parseBiomFile(buf, file.name);
    return NextResponse.json({ preview: parsed.preview, fileName: file.name });
  } catch (err) {
    const message =
      err instanceof BiomParseError || (err instanceof Error && err.name === "FastqParseError")
        ? err.message
        : "Could not parse the uploaded file format.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
