"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useMatchStore } from "@/store/match-store";
import { inferTeamStyle } from "@/lib/scoring/teamStyle";
import { MatchContext } from "@/components/MatchContext";
import { FastAccessPanel } from "@/components/FastAccessPanel";
import { SlotRow } from "@/components/SlotRow";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { HeroPickerSheet } from "@/components/HeroPickerSheet";
import { HeroDetailSheet } from "@/components/HeroDetailSheet";
import type { Role } from "@/lib/types";

export default function Page() {
  const {
    team,
    enemy,
    clearMatch,
    setTeamHero,
    setEnemyHero,
    setActiveSelection,
    selectedRole,
  } = useMatchStore();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSide, setPickerSide] = useState<"team" | "enemy">("team");
  const [slotIndex, setSlotIndex] = useState(0);

  const teamStyle = inferTeamStyle(team.filter(Boolean) as NonNullable<(typeof team)[number]>[]);

  const openPicker = (side: "team" | "enemy", index: number) => {
    setPickerSide(side);
    setSlotIndex(index);
    setActiveSelection({ side, index });
    setPickerOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Overwatch Hero Picker</div>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">V1 App Scaffold</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Fast match-state entry, transparent recommendations, and fast-access buttons that now target the slot you actually selected. A shocking triumph over avoidable UX nonsense.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Comp style: {teamStyle}</Badge>
            <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" onClick={clearMatch}>
              <RotateCcw className="mr-2 h-4 w-4" /> Clear Match
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <MatchContext />
            <FastAccessPanel />

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
              <div className="space-y-6">
                <SlotRow
                  title="Your Team"
                  heroesInSlots={team}
                  onOpenSlot={(index) => openPicker("team", index)}
                  onClearSlot={(index) => setTeamHero(index, null)}
                />
                <SlotRow
                  title="Enemy Team"
                  heroesInSlots={enemy}
                  onOpenSlot={(index) => openPicker("enemy", index)}
                  onClearSlot={(index) => setEnemyHero(index, null)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <RecommendationPanel />
          </div>
        </div>
      </div>

      <HeroPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        side={pickerSide}
        slotIndex={slotIndex}
        initialRole={pickerSide === "team" && slotIndex === 0 ? (selectedRole as Role) : "DPS"}
      />

      <HeroDetailSheet />
    </main>
  );
}
