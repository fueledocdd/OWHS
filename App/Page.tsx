"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useMatchStore } from "@/store/match-store";
import { inferTeamStyle } from "@/lib/scoring/teamStyle";

export default function Page() {
  const {
    team,
    clearMatch,
    getRecommendations,
  } = useMatchStore();

  const teamStyle = inferTeamStyle((team.filter(Boolean) as NonNullable<(typeof team)[number]>[]));
  const recommendations = useMemo(() => getRecommendations(), [team, getRecommendations]);

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Overwatch Hero Picker</div>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">V1 App Scaffold</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              This page becomes the composition root. The giant prototype dies here, which is for the best.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Comp style: {teamStyle}</Badge>
            <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" onClick={clearMatch}>
              <RotateCcw className="mr-2 h-4 w-4" /> Clear Match
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
          Next step: wire in `MatchContext`, `FastAccessPanel`, `SlotRow`, `RecommendationPanel`, `HeroPickerSheet`, and `HeroDetailSheet` as separate components.
          
          Current recommendation count: {recommendations.length}
        </div>
      </div>
    </main>
  );
}
