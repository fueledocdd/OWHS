import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useMatchStore } from "@/store/match-store";
import { getModeRules } from "@/lib/data/modeRules";
import { HeroPortrait } from "@/components/HeroPortrait";

export function RecommendationPanel() {
  const { getRecommendations, setDetailHero, matchFormat } = useMatchStore();
  const recommendations = useMemo(() => getRecommendations(), [getRecommendations]);
  const rules = getModeRules(matchFormat);

  const top3 = recommendations.slice(0, 3);
  const avoidList = recommendations.slice().reverse().slice(0, 2);
  const confidence = top3.length > 0 ? Math.min(96, Math.max(48, top3[0].total)) : 0;
  const panelTitle = matchFormat === "stadium" ? "Recommended Opening Picks" : "Recommended Picks";

  return (
    <Card className="sticky top-4 rounded-3xl border-slate-800 bg-slate-900/80 text-white shadow-xl backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{panelTitle}</span>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">{rules.recommendationPhase}</Badge>
            <Badge className="rounded-full bg-sky-500 px-3 py-1 text-white">Confidence {confidence}%</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {top3.map((rec, index) => (
          <motion.button
            whileHover={{ y: -2 }}
            key={rec.hero.id}
            onClick={() => setDetailHero(rec)}
            className={`w-full rounded-2xl border p-4 text-left transition ${index === 0 ? "border-sky-400 bg-slate-800" : "border-slate-700 bg-slate-900 hover:border-slate-500"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <HeroPortrait heroId={rec.hero.id} heroName={rec.hero.name} size={56} />
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-slate-400">#{index + 1} Suggestion</div>
                  <div className="mt-1 text-lg font-semibold leading-tight">{rec.hero.name}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{rec.hero.role}</Badge>
                    <Badge variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{rec.hero.subRole}</Badge>
                    {rec.hero.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full bg-slate-700 text-slate-100">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-sky-300">{rec.total}</div>
                <div className="text-xs text-slate-400">score</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {rec.reasons.slice(0, 3).map((reason) => (
                <div key={reason} className="text-sm text-slate-300">• {reason}</div>
              ))}
            </div>
          </motion.button>
        ))}

        {matchFormat !== "stadium" && (
          <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4">
            <div className="text-sm font-semibold text-rose-200">Avoid for now</div>
            <div className="mt-3 space-y-2">
              {avoidList.map((item) => (
                <div key={item.hero.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <HeroPortrait heroId={item.hero.id} heroName={item.hero.name} size={32} />
                    <span>{item.hero.name}</span>
                  </div>
                  <span className="text-slate-400">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
