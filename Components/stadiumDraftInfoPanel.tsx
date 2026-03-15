import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { roles } from "@/lib/data/maps";
import { resolvedHeroes } from "@/lib/data/resolvedHeroes";
import { useMatchStore } from "@/store/match-store";
import type { DraftPhase, DraftTeamSide, Role } from "@/lib/types";

function slotLabel(team: DraftTeamSide, slotIndex: number) {
  return `${team === "ally" ? "Ally" : "Enemy"} ${slotIndex + 1}`;
}

export function StadiumDraftInfoPanel() {
  const {
    matchFormat,
    draftContext,
    setDraftPhase,
    setDraftSlotKnownHero,
    setDraftSlotExpectedRole,
    setDraftSlotKnownState,
    resetDraftContext,
  } = useMatchStore();

  if (matchFormat !== "stadium") return null;

  const allySlots = draftContext.slots.filter((slot) => slot.team === "ally");
  const enemySlots = draftContext.slots.filter((slot) => slot.team === "enemy");

  const renderSlot = (team: DraftTeamSide, slotIndex: number) => {
    const slot = draftContext.slots.find((entry) => entry.team === team && entry.slotIndex === slotIndex);
    if (!slot) return null;

    const availableHeroes = resolvedHeroes.filter((hero) => !draftContext.slots.some((s) => s.heroId === hero.id));

    return (
      <div key={`${team}-${slotIndex}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-white">{slotLabel(team, slotIndex)}</div>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
            onClick={() => setDraftSlotKnownState(team, slotIndex, !slot.isKnown)}
          >
            {slot.isKnown ? "Known" : "Unknown"}
          </Button>
        </div>

        <Select
          value={slot.heroId ?? "none"}
          onValueChange={(value) => setDraftSlotKnownHero(team, slotIndex, value === "none" ? undefined : value)}
        >
          <SelectTrigger className="rounded-2xl border-slate-700 bg-slate-900 text-white">
            <SelectValue placeholder="Visible hero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unknown / none</SelectItem>
            {availableHeroes.map((hero) => (
              <SelectItem key={hero.id} value={hero.id}>{hero.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={slot.expectedRole ?? "unknown-role"}
          onValueChange={(value) => setDraftSlotExpectedRole(team, slotIndex, value === "unknown-role" ? undefined : (value as Role))}
        >
          <SelectTrigger className="rounded-2xl border-slate-700 bg-slate-900 text-white">
            <SelectValue placeholder="Expected role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown-role">Unknown role</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {slot.isKnown && <Badge className="rounded-full bg-slate-800 text-slate-200">visible</Badge>}
          {slot.expectedRole && <Badge className="rounded-full bg-slate-800 text-slate-200">{slot.expectedRole}</Badge>}
        </div>
      </div>
    );
  };

  return (
    <Card className="rounded-3xl border-slate-800 bg-slate-900/70 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Stadium Draft Context</span>
          <div className="flex items-center gap-2">
            <Tabs value={draftContext.phase} onValueChange={(value) => setDraftPhase(value as DraftPhase)}>
              <TabsList className="grid grid-cols-3 rounded-2xl bg-slate-800">
                <TabsTrigger value="prepick">Prepick</TabsTrigger>
                <TabsTrigger value="partial-reveal">Partial</TabsTrigger>
                <TabsTrigger value="post-reveal">Revealed</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
              onClick={resetDraftContext}
            >
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
          Mark only the picks you can actually see. Unknown slots can still carry expected roles so the app can reason under uncertainty instead of pretending the board is complete.
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-200">Visible Allies</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {allySlots.map((slot) => renderSlot("ally", slot.slotIndex))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-200">Visible Enemies</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {enemySlots.map((slot) => renderSlot("enemy", slot.slotIndex))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
