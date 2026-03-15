import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroPortrait } from "@/components/HeroPortrait";
import { resolvedHeroes, getResolvedHero } from "@/lib/data/resolvedHeroes";
import { useMatchStore } from "@/store/match-store";

export function BanPhasePanel() {
  const {
    selectedMode,
    matchFormat,
    banPhase,
    setPreferredHero,
    toggleBannedHero,
    clearBans,
    getBanRecommendations,
  } = useMatchStore();

  const isCompetitiveBanFlow = selectedMode === "Competitive" && matchFormat !== "stadium";
  if (!isCompetitiveBanFlow) return null;

  const preferredHero = banPhase.preferredHeroId ? getResolvedHero(banPhase.preferredHeroId) : null;
  const recommendations = getBanRecommendations();

  return (
    <Card className="rounded-3xl border-slate-800 bg-slate-900/70 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Ban Phase</span>
          <Button variant="outline" className="border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={clearBans}>
            Clear Bans
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
          Competitive bans happen before enemy reveal, so these suggestions protect your likely pick or team plan rather than reacting to a known enemy comp.
        </div>

        <div>
          <div className="mb-2 text-sm text-slate-300">Preferred hero</div>
          <div className="flex flex-wrap gap-2">
            {resolvedHeroes.slice(0, 12).map((hero) => {
              const active = preferredHero?.id === hero.id;
              return (
                <Button
                  key={hero.id}
                  size="sm"
                  variant="outline"
                  className={active ? "border-sky-400 bg-slate-800 text-white" : "border-slate-700 bg-slate-950 text-slate-100"}
                  onClick={() => setPreferredHero(active ? undefined : hero.id)}
                >
                  {hero.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm text-slate-300">Banned heroes</div>
          <div className="flex flex-wrap gap-2">
            {banPhase.bannedHeroIds.length === 0 ? (
              <div className="text-sm text-slate-500">No bans selected</div>
            ) : (
              banPhase.bannedHeroIds.map((heroId) => {
                const hero = getResolvedHero(heroId);
                if (!hero) return null;
                return (
                  <Badge key={heroId} className="rounded-full bg-rose-900/60 px-3 py-1 text-rose-100">
                    {hero.name}
                  </Badge>
                );
              })
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm text-slate-300">Suggested bans</div>
          <div className="space-y-2">
            {recommendations.map((item) => {
              const hero = getResolvedHero(item.heroId);
              if (!hero) return null;
              return (
                <div key={item.heroId} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <HeroPortrait heroId={hero.id} heroName={hero.name} size={40} />
                      <div>
                        <div className="text-sm font-semibold text-white">{hero.name}</div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{hero.role}</Badge>
                          <Badge variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{hero.subRole}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                      onClick={() => toggleBannedHero(hero.id)}
                    >
                      {banPhase.bannedHeroIds.includes(hero.id) ? "Unban" : "Ban"}
                    </Button>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-300">
                    {item.reasons.slice(0, 3).map((reason) => (
                      <div key={reason}>• {reason}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
