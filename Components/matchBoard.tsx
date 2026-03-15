import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlotRow } from "@/components/SlotRow";
import { useMatchStore } from "@/store/match-store";
import { getModeRules } from "@/lib/data/modeRules";
import { getResolvedHero } from "@/lib/data/resolvedHeroes";

function buildStadiumBoardFromDraft(draftContext: ReturnType<typeof useMatchStore.getState>["draftContext"], teamSize: number) {
  const ally = Array(teamSize).fill(null);
  const enemy = Array(teamSize).fill(null);

  draftContext.slots.forEach((slot) => {
    const hero = slot.heroId ? getResolvedHero(slot.heroId) : null;
    if (!hero) return;

    if (slot.team === "ally") ally[slot.slotIndex] = hero;
    if (slot.team === "enemy") enemy[slot.slotIndex] = hero;
  });

  return { ally, enemy };
}

type MatchBoardProps = {
  onOpenSlot: (side: "team" | "enemy", index: number) => void;
};

export function MatchBoard({ onOpenSlot }: MatchBoardProps) {
  const {
    team,
    enemy,
    setTeamHero,
    setEnemyHero,
    matchFormat,
    draftContext,
    setDraftSlotKnownHero,
    setDraftSlotKnownState,
  } = useMatchStore();

  const rules = getModeRules(matchFormat);
  const isStadium = matchFormat === "stadium";

  const stadiumBoard = isStadium
    ? buildStadiumBoardFromDraft(draftContext, rules.teamSize)
    : null;

  const displayedTeam = isStadium ? stadiumBoard?.ally ?? team : team;
  const displayedEnemy = isStadium ? stadiumBoard?.enemy ?? enemy : enemy;

  const clearTeamSlot = (index: number) => {
    if (isStadium) {
      setDraftSlotKnownHero("ally", index, undefined);
      setDraftSlotKnownState("ally", index, false);
      return;
    }
    setTeamHero(index, null);
  };

  const clearEnemySlot = (index: number) => {
    if (isStadium) {
      setDraftSlotKnownHero("enemy", index, undefined);
      setDraftSlotKnownState("enemy", index, false);
      return;
    }
    setEnemyHero(index, null);
  };

  return (
    <Card className="rounded-3xl border-slate-800 bg-slate-900/70 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Live Match State</span>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              {rules.label} • {rules.teamSize}v{rules.teamSize}
            </Badge>
            {isStadium && (
              <Badge className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                Draft-synced
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SlotRow
          title="Your Team"
          heroesInSlots={displayedTeam}
          onOpenSlot={(index) => onOpenSlot("team", index)}
          onClearSlot={clearTeamSlot}
          compact={displayedTeam.length > 5}
        />

        {isStadium ? (
          <SlotRow
            title="Enemy Team"
            heroesInSlots={displayedEnemy}
            onOpenSlot={(index) => onOpenSlot("enemy", index)}
            onClearSlot={clearEnemySlot}
            compact={displayedEnemy.length > 5}
          />
        ) : (
          <SlotRow
            title="Enemy Team"
            heroesInSlots={enemy}
            onOpenSlot={(index) => onOpenSlot("enemy", index)}
            onClearSlot={(index) => setEnemyHero(index, null)}
            compact={enemy.length > 5}
          />
        )}
      </CardContent>
    </Card>
  );
}
