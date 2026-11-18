import {useSyncExternalStore} from "react";

/** Mirrors the toggles served by GET /api/features (server/api/toggles.js). */
export interface Features {
    guestbook: boolean;
    loaded: boolean;
}

// Everything starts off until the server says otherwise, so a disabled feature
// never flashes on screen.
let state: Features = {guestbook: false, loaded: false};
const listeners = new Set<() => void>();
let requested = false;

function load() {
    if (requested) return;
    requested = true;
    fetch("/api/features", {credentials: "same-origin"})
        .then((res) => (res.ok ? res.json() : {}))
        .catch(() => ({}))
        .then((data: Partial<Record<keyof Features, unknown>>) => {
            state = {guestbook: data.guestbook === true, loaded: true};
            listeners.forEach((l) => l());
        });
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    load();
    return () => listeners.delete(listener);
}

export function useFeatures(): Features {
    return useSyncExternalStore(subscribe, () => state, () => state);
}

/** Non-hook access, e.g. inside terminal commands. */
export const getFeatures = () => state;
