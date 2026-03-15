import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, Swords, Shield, Crosshair, HeartPulse } from "lucide-react";
import type { ResolvedHero, Role } from "@/lib/types";

function roleIcon(role: Role) {
  if (role === "Tank") return <Shield className="h-4 w-4" />;
  if (role === "DPS") return <Crosshair className="h-4 w-4" />;
  return <HeartPulse className="h-4 w-4" />;
}

function heroTileTone(hero: ResolvedHero) {
  if (hero.role === "Tank") return "border-emerald-500/40";
  if (hero.role === "DPS") return "border-rose-500/40";
  return "border-sky-500/40";
}

type HeroPickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: "team" | "enemy";
  slotIndex: number;
  initialRole?: Role;
};

export function HeroPickerSheet({ open, onOpenChange, side, slotIndex, initialRole = "DPS" }: HeroPickerSheetProps) {
  const [pickerRole, setPickerRole] = useState<Role>(initialRole);
  const [pickerSearch, setPickerSearch] = useState("");
  const { favoriteHeroIds, recentHeroIds, toggleFavorite, setTeamHero, setEnemyHero } = useMatchStore();

  const favoriteHeroes = favoriteHeroIds.map(getHeroById).filter(Boolean) as Hero[];
  const recentHeroes = recentHeroIds.map(getHeroById).filter(Boolean) as Hero[];

  const visibleHeroes = useMemo(() => {
    return resolvedHeroes.filter((hero) => {
      const matchesRole = hero.role === pickerRole;
      const matchesSearch = hero.name.toLowerCase().includes(pickerSearch.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [pickerRole, pickerSearch]);

  const selectHero = (hero: ResolvedHero) => {
    if (side === "team") setTeamHero(slotIndex, hero);
    else setEnemyHero(slotIndex, hero);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[88vh] rounded-t-3xl border-slate-800 bg-slate-950 text-white">
        <SheetHeader>
          <SheetTitle className="text-left text-white">Select Hero</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search hero"
              className="rounded-2xl border-slate-700 bg-slate-900 pl-10 text-white placeholder:text-slate-500"
            />
          </div>

          <Tabs value={pickerRole} onValueChange={(value) => setPickerRole(value as Role)}>
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-800">
              {roles.map((role) => (
                <TabsTrigger key={role} value={role} className="rounded-xl data-[state=active]:bg-sky-500 data-[state=active]:text-white">
                  <span className="flex items-center gap-1">{roleIcon(role)} {role}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {(favoriteHeroes.length > 0 || recentHeroes.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-sm text-slate-300">Favorites</div>
                <div className="flex flex-wrap gap-2">
                  {favoriteHeroes.filter((hero) => hero.role === pickerRole).map((hero) => (
                    <Button key={hero.id} variant="outline" className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" onClick={() => selectHero(hero)}>
                      {hero.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm text-slate-300">Recent</div>
                <div className="flex flex-wrap gap-2">
                  {recentHeroes.filter((hero) => hero.role === pickerRole).map((hero) => (
                    <Button key={hero.id} variant="outline" className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" onClick={() => selectHero(hero)}>
                      {hero.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleHeroes.map((hero) => (
              <motion.div whileTap={{ scale: 0.97 }} key={hero.id}>
                <button onClick={() => selectHero(hero)} className={`w-full rounded-2xl border bg-slate-900 p-4 text-left transition hover:border-sky-400 hover:bg-slate-800 ${heroTileTone(hero)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold">{hero.name}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(hero.id);
                      }}
                      className={`rounded-full p-1 ${favoriteHeroIds.includes(hero.id) ? "text-amber-300" : "text-slate-500"}`}
                      aria-label={`Toggle favorite for ${hero.name}`}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hero.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{tag}</Badge>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-400">Comfort {hero.comfort ?? 5}/10</div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
