import { Card, CardContent } from "@/components/ui/card";
import { useMatchStore } from "@/store/match-store";
import { getOnboardingDefaults } from "@/lib/data/onboardingDefaults";

export function OnboardingHint() {
  const { matchFormat, userProfile } = useMatchStore();

  const configuredCount = userProfile.heroPreferences.length;
  if (configuredCount >= 3) return null;

  const defaults = getOnboardingDefaults(matchFormat);

  return (
    <Card className="rounded-3xl border-slate-800 bg-slate-900/70 text-white shadow-xl">
      <CardContent className="p-4 text-sm text-slate-300">
        <div className="font-semibold text-white">Quick setup hint</div>
        <div className="mt-2">{defaults.suggestedProfilePrompt}</div>
      </CardContent>
    </Card>
  );
}
