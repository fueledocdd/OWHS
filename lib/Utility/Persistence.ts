import type { MatchState } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/data/maps";

export function loadPersistedMatchState(): Partial<MatchState> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<MatchState>;
  } catch {
    return null;
  }
}

export function savePersistedMatchState(state: Partial<MatchState>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage fails sometimes because browsers are little bureaucracies
  }
}

export function clearPersistedMatchState() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
