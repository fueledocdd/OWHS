import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMatchStore } from "@/store/match-store";

export function StadiumBuildPanel() {
  const { matchFormat, team } = useMatchStore();

  if (matchFormat !== "stadium") return null;

  const selectedHero = team[0];

  return (
    <Card className="rounded-3xl border-slate-800 bg-slate-900/70 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Stadium Build Path</span>
          <Badge className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Placeholder</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedHero ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-400">
            Pick your Stadium hero first. Build advice belongs after hero selection, not before. Humans love asking systems to optimize variables they have not chosen yet.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-sm text-slate-300">Selected hero</div>
              <div className="mt-1 text-lg font-semibold text-white">{selectedHero.name}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{selectedHero.role}</Badge>
                <Badge variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{selectedHero.subRole}</Badge>
                {selectedHero.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-sm font-semibold text-white">Suggested Power Direction</div>
                <div className="mt-2 text-sm text-slate-300">
                  Reserve this area for hero-specific Power recommendations once Stadium itemization logic is built.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-sm font-semibold text-white">Suggested Item Path</div>
                <div className="mt-2 text-sm text-slate-300">
                  Reserve this area for economy-aware item sequencing after we model cash, rounds, and revealed enemy threats.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
              Later Stadium logic should consider: chosen hero, map, round state, economy, revealed enemy comp, and whether the user wants safer sustain, burst, anti-dive, or tempo scaling.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
