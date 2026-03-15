import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Layers3 } from "lucide-react";
import { getResolvedHero } from "@/lib/data/resolvedHeroes";
import { useMatchStore } from "@/store/match-store";
import type { ResolvedHero } from "@/lib/types";

export function FastAccessPanel() {
  const {
    favoriteHeroIds,
    recentHeroIds,
    activeSelection,
    setTeamHero,
    setEnemyHero,
  } = useMatchStore();

  const favoriteHeroes = favoriteHeroIds.map(getResolvedHero).filter(Boolean) as ResolvedHero[];
  const recentHeroes = recentHeroIds.map(getResolvedHero).filter(Boolean) as ResolvedHero[];

  const applyHero = (hero: ResolvedHero) => {
    if (activeSelection.side === "enemy") {
      setEnemyHero(activeSelection.index, hero);
      return;
    }
    setTeamHero(activeSelection.index, hero);
  };

  return (
    <Card className="rounded-3xl border-slate-800 bg-slate-900/70 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Fast Access</span>
          <span className="text-sm font-normal text-slate-400">
            Targeting {activeSelection.side === "team" ? "your team" : "enemy team"} slot {activeSelection.index + 1}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
            <Star className="h-4 w-4" /> Favorites
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteHeroes.map((hero) => (
              <Button
                key={hero.id}
                variant="outline"
                className="border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800"
                onClick={() => applyHero(hero)}
              >
                {hero.name}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
            <Layers3 className="h-4 w-4" /> Recent
          </div>
          <div className="flex flex-wrap gap-2">
            {recentHeroes.map((hero) => (
              <Button
                key={hero.id}
                variant="outline"
                className="border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800"
                onClick={() => applyHero(hero)}
              >
                {hero.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
