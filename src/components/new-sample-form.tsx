"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_LABELS } from "@/lib/microbiome/samples";
import type { SampleProfileId } from "@/lib/microbiome/types";

export function NewSampleForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = {
      displayName: formData.get("displayName"),
      patientCode: formData.get("patientCode"),
      age: Number(formData.get("age")),
      sex: formData.get("sex"),
      indication: formData.get("indication"),
      dietPattern: formData.get("dietPattern"),
      profileId: formData.get("profileId"),
      recentAntibiotics: formData.get("recentAntibiotics") === "on",
    };
    const res = await fetch("/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(json.error ?? "Could not create sample.");
      return;
    }
    router.push(`/reports/${json.sample.id}/doctor`);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Case label</Label>
          <Input id="displayName" name="displayName" required placeholder="Adult, GI clinic" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="patientCode">Patient code</Label>
          <Input id="patientCode" name="patientCode" placeholder="ONC-8891" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" min={1} max={120} defaultValue={44} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sex">Sex</Label>
          <select
            id="sex"
            name="sex"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            defaultValue="unspecified"
          >
            <option value="unspecified">Unspecified</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="indication">Clinical indication</Label>
        <Textarea
          id="indication"
          name="indication"
          required
          placeholder="e.g. bloating, prior antibiotics, metabolic risk"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dietPattern">Diet history</Label>
        <Input id="dietPattern" name="dietPattern" placeholder="Low fiber, frequent takeaway" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="profileId">Community profile (demo sequencer)</Label>
        <select
          id="profileId"
          name="profileId"
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          defaultValue="dysbiosis-amr"
        >
          {(Object.keys(PROFILE_LABELS) as SampleProfileId[]).map((id) => (
            <option key={id} value={id}>
              {PROFILE_LABELS[id].title}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          In production this is replaced by the WGS classifier. Here you choose a realistic community
          so each report type can be demonstrated.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="recentAntibiotics" className="size-4 accent-[#1f4f4a]" />
        Antibiotics in the last 8 weeks
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Accessioning…" : "Generate doctor report"}
      </Button>
    </form>
  );
}
