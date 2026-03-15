import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useMatchStore } from "@/store/match-store";

export function HeroDetailSheet() {
  const { detailHero, setDetailHero } = useMatchStore();

  return (
    <Sheet open={!!detailHero} onOpenChange={(open) => !open && setDetailHero(null)}>
      <SheetContent className="w-full border-slate-800 bg-slate-950 text-white sm:max-w-lg">
        {detailHero && (
          <>
            <SheetHeader>
              <SheetTitle className="text-left text-white">Why {detailHero.hero.name}</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-sm text-slate-300">Overall recommendation score</div>
                <div className="mt-2 text-3xl font-bold text-sky-300">{detailHero.total}</div>
                <div className="mt-2 text-sm text-slate-400">{detailHero.hero.role} • {detailHero.hero.subRole}</div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div>
                  <div className="mb-1 text-sm text-slate-300">Counter value</div>
                  <Progress value={Math.min(100, detailHero.counter)} />
                </div>
                <div>
                  <div className="mb-1 text-sm text-slate-300">Synergy value</div>
                  <Progress value={Math.min(100, detailHero.synergy)} />
                </div>
                <div>
                  <div className="mb-1 text-sm text-slate-300">Map fit</div>
                  <Progress value={Math.min(100, detailHero.map * 2.5)} />
                </div>
                <div>
                  <div className="mb-1 text-sm text-slate-300">Comfort</div>
                  <Progress value={detailHero.comfort * 10} />
                </div>
                <div>
                  <div className="mb-1 text-sm text-slate-300">Meta / rank bonus</div>
                  <Progress value={Math.min(100, detailHero.meta * 10)} />
                </div>
                <div>
                  <div className="mb-1 text-sm text-slate-300">Sub-role modifier</div>
                  <Progress value={Math.min(100, detailHero.subRole * 20)} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-sm font-semibold text-white">Reasoning</div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  {detailHero.reasons.map((reason) => (
                    <div key={reason}>• {reason}</div>
                  ))}
                  {detailHero.reasons.length === 0 && (
                    <div>• Neutral recommendation from incomplete match state. The machine can only rescue so much missing input.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                Execution difficulty: {detailHero.hero.difficulty ?? 5}/10
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
