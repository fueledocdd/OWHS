import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroPortrait } from "@/components/HeroPortrait";
import { resolvedHeroes } from "@/lib/data/resolvedHeroes";
import { useMatchStore } from "@/store/match-store";
import type { Role } from "@/lib/types";

export function FirstRunMainsHelper() {
  const [roleFilter, setRoleFilter] = useState<Role>("DPS");
  const {
    userProfile,
    setHeroComfortLabel,
  } = useMatchStore();

  const mainCount = userProfile.heroPreferences.filter((pref) => pref.label === "Main").length;
  if (mainCount >= 1) return null;

  const heroes = useMemo(() => {
    return resolvedHeroes.filter((hero) => hero.role === roleFilter).slice(0, 12);
  }, [roleFilter]);

  const getCurrentLabel = (heroId: string) => {
    return userProfile.heroPreferences.find((pref) => pref.heroId === heroId)?.label ?? "Default";
  };

  return (
    <Card className="rounded-3xl border-slate-800 bg-slate-900/70 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg">Quick mains setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-slate-300">
          Tag 3 to 5 heroes you actually trust. This gives the app usable signal fast without demanding a full personality inventory for the entire roster.
        </div>

        <Tabs value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role)}>
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-800">
            <TabsTrigger value="Tank">Tank</TabsTrigger>
            <TabsTrigger value="DPS">DPS</TabsTrigger>
            <TabsTrigger value="Support">Support</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {heroes.map((hero) => {
            const isMain = getCurrentLabel(hero.id) === "Main";
            return (
              <div key={hero.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-start gap-3">
                  <HeroPortrait heroId={hero.id} heroName={hero.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white">{hero.name}</div>
                    <div className="text-xs text-slate-400">{hero.subRole}</div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={isMain ? "border-sky-400 bg-slate-800 text-white" : "border-slate-700 bg-slate-950 text-slate-100"}
                    onClick={() => setHeroComfortLabel(hero.id, isMain ? "Default" : "Main")}
                  >
                    {isMain ? "Unmark Main" : "Mark Main"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 bg-slate-950 text-slate-100"
                    onClick={() => setHeroComfortLabel(hero.id, "Comfortable")}
                  >
                    Comfortable
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
