import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPinned, Shield, Crosshair, HeartPulse } from "lucide-react";
import { modes, ranks, roles, maps } from "@/lib/data/maps";
import { useMatchStore } from "@/store/match-store";
import type { Role, Mode, Rank } from "@/lib/types";

function roleIcon(role: Role) {
  if (role === "Tank") return <Shield className="h-4 w-4" />;
  if (role === "DPS") return <Crosshair className="h-4 w-4" />;
  return <HeartPulse className="h-4 w-4" />;
}

export function MatchContext() {
  const {
    selectedRole,
    selectedMode,
    selectedMap,
    selectedRank,
    setSelectedRole,
    setSelectedMode,
    setSelectedMap,
    setSelectedRank,
  } = useMatchStore();

  return (
    <Card className="rounded-3xl border-slate-800 bg-slate-900/70 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPinned className="h-5 w-5" /> Match Context
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <div className="text-sm text-slate-300">Your Role</div>
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-800">
              {roles.map((role) => (
                <TabsTrigger key={role} value={role} className="rounded-xl data-[state=active]:bg-sky-500 data-[state=active]:text-white">
                  <span className="flex items-center gap-1">{roleIcon(role)} {role}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-slate-300">Mode</div>
          <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value as Mode)}>
            <SelectTrigger className="rounded-2xl border-slate-700 bg-slate-950 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modes.map((mode) => (
                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-slate-300">Rank</div>
          <Select value={selectedRank} onValueChange={(value) => setSelectedRank(value as Rank)}>
            <SelectTrigger className="rounded-2xl border-slate-700 bg-slate-950 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ranks.map((rank) => (
                <SelectItem key={rank} value={rank}>{rank}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-4">
          <div className="text-sm text-slate-300">Map</div>
          <Select value={selectedMap} onValueChange={setSelectedMap}>
            <SelectTrigger className="rounded-2xl border-slate-700 bg-slate-950 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {maps.map((map) => (
                <SelectItem key={map} value={map}>{map}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
