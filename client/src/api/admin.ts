export interface AdminEntry {
    id: string;
    name: string;
    message: string;
    createdAt: string;
    hidden: boolean;
    visitor: string | null;
}

export interface AdminStats {
    total: number;
    visible: number;
    hidden: number;
    last24h: number;
    dailyCap: number;
}

export interface ActivityEvent {
    at: string;
    type: "blocked" | "rejected" | "signed" | "admin";
    detail: string;
    visitor?: string;
}

export type EntryFilter = "all" | "visible" | "hidden";

export class AdminError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api/admin${path}`, {
        ...init,
        credentials: "same-origin",
        headers: {
            "X-Admin-Client": "web-ui",
            ...(init.body ? {"Content-Type": "application/json"} : {}),
            ...init.headers,
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new AdminError(data.error || "Something went wrong.", res.status);
    return data as T;
}

export const getMe = () => request<{authenticated: boolean}>("/me");
export const login = (password: string) =>
    request<{authenticated: boolean}>("/login", {method: "POST", body: JSON.stringify({password})});
export const logout = () => request<{authenticated: boolean}>("/logout", {method: "POST", body: "{}"});
export const getStats = () => request<AdminStats>("/stats");
export const getEntries = (status: EntryFilter, before?: string) => {
    const params = new URLSearchParams({status});
    if (before) params.set("before", before);
    return request<{entries: AdminEntry[]; hasMore: boolean}>(`/entries?${params}`);
};
export const setHidden = (id: string, hidden: boolean) =>
    request<{entry: AdminEntry}>(`/entries/${id}`, {method: "PATCH", body: JSON.stringify({hidden})});
export const deleteEntry = (id: string) => request<{deleted: boolean}>(`/entries/${id}`, {method: "DELETE"});
export const getActivity = () => request<{events: ActivityEvent[]}>("/activity");

export interface Toggle {
    key: string;
    description: string;
    enabled: boolean;
    updatedAt: string | null;
    stored: boolean;
}

export const getToggles = () => request<{toggles: Toggle[]}>("/toggles");
export const setToggle = (key: string, enabled: boolean) =>
    request<{key: string; enabled: boolean}>(`/toggles/${encodeURIComponent(key)}`, {method: "PATCH", body: JSON.stringify({enabled})});
