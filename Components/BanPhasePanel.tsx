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

  const isCompetitiveBanFlow =
    selectedMode === "Competitive" && matchFormat !== "stadium";

  if (!isCompetitiveBanFlow) return null;

  const preferredHero = banPhase.preferredHeroId
    ? getResolvedHero(banPhase.preferredHeroId)
    : null;

  const recommendations = getBanRecommendations();
  const preferredHeroOptions = resolvedHeroes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card className="rounded-2xl border-slate-800 bg-slate-950 text-slate-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Ban Phase</CardTitle>
          <p className="mt-2 text-sm text-slate-400">
            Competitive bans happen before enemy reveal, so these suggestions
            protect your likely pick or team plan rather than reacting to a known
            enemy comp.
          </p>
        </div>
        <Button variant="outline" onClick={clearBans}>
          Clear Bans
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div className="text-sm font-medium text-slate-300">Preferred hero</div>
          <div className="flex flex-wrap gap-2">
            {preferredHeroOptions.map((hero) => {
              const active = preferredHero?.id === hero.id;
              return (
                <Button
                  key={hero.id}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreferredHero(active ? undefined : hero.id)}
                  className="gap-2"
                >
                  <HeroPortrait hero={hero} size={20} />
                  {hero.name}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-medium text-slate-300">Banned heroes</div>
          {banPhase.bannedHeroIds.length === 0 ? (
            <p className="text-sm text-slate-500">No bans selected</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {banPhase.bannedHeroIds.map((heroId) => {
                const hero = getResolvedHero(heroId);
                if (!hero) return null;
                return (
                  <Badge key={hero.id} variant="secondary" className="gap-2 px-3 py-1">
                    <HeroPortrait hero={hero} size={18} />
                    {hero.name}
                  </Badge>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="text-sm font-medium text-slate-300">Suggested bans</div>
          <div className="space-y-3">
            {recommendations.map((item) => {
              const hero = getResolvedHero(item.heroId);
              if (!hero) return null;

              return (
                <div
                  key={hero.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <HeroPortrait hero={hero} size={28} />
                        <div>
                          <div className="font-medium text-slate-100">{hero.name}</div>
                          <div className="text-xs text-slate-400">
                            {hero.role} · {hero.subRole}
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-1 text-sm text-slate-300">
                        {item.reasons.slice(0, 3).map((reason) => (
                          <li key={reason}>• {reason}</li>
                        ))}
                      </ul>
                    </div>

                    <Button onClick={() => toggleBannedHero(hero.id)}>
                      {banPhase.bannedHeroIds.includes(hero.id) ? "Unban" : "Ban"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
