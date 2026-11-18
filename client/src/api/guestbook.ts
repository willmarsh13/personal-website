export interface GuestbookEntry {
    id: string;
    name: string;
    message: string;
    createdAt: string;
}

export interface GuestbookPage {
    entries: GuestbookEntry[];
    hasMore: boolean;
}

export interface GuestbookSession {
    alreadySigned: boolean;
    token?: string;
}

export class GuestbookError extends Error {
    constructor(message: string, public status: number, public retry = false) {
        super(message);
    }
}

/** localStorage key set once this browser has signed. */
export const SIGNED_STORAGE_KEY = "guestbook:signed";

// Limits mirror server/api/guestbook/moderation.js
export const NAME_MAX = 40;
export const MESSAGE_MAX = 280;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api/guestbook${path}`, {
        ...init,
        credentials: 'same-origin',
        headers: {
            'X-Guestbook-Client': 'web-ui',
            ...(init.body ? {'Content-Type': 'application/json'} : {}),
            ...init.headers,
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new GuestbookError(data.error || 'Something went wrong.', res.status, Boolean(data.retry));
    }
    return data as T;
}

export const fetchEntries = (before?: string) =>
    request<GuestbookPage>(before ? `?before=${encodeURIComponent(before)}` : '');

export const fetchSession = () => request<GuestbookSession>('/session');

export const signGuestbook = (body: {name: string; message: string; token: string; website: string}) =>
    request<{entry: GuestbookEntry}>('', {method: 'POST', body: JSON.stringify(body)});
