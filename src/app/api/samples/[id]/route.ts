import { NextResponse } from "next/server";
import { getSample, deleteSample } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const sample = await getSample(id);
    if (!sample) {
      return NextResponse.json({ error: "Sample not found." }, { status: 404 });
    }
    return NextResponse.json({ sample });
  } catch (err) {
    console.error("Error fetching sample by ID:", err);
    return NextResponse.json({ error: "Failed to fetch sample from database" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const existing = await getSample(id);
    if (!existing) {
      return NextResponse.json({ error: "Sample not found." }, { status: 404 });
    }

    const success = await deleteSample(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete sample." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Sample ${id} (${existing.displayName}) and all associated reports have been permanently deleted.`,
    });
  } catch (err) {
    console.error("Error deleting sample:", err);
    return NextResponse.json({ error: "Failed to delete sample from database" }, { status: 500 });
  }
}
