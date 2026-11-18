import React, {useCallback, useEffect, useState} from "react";
import {
    ActivityEvent,
    AdminEntry,
    AdminError,
    AdminStats,
    deleteEntry,
    EntryFilter,
    getActivity,
    getEntries,
    getMe,
    getStats,
    getToggles,
    login,
    logout,
    setHidden,
    setToggle,
    Toggle,
} from "../../api/admin";
import {Alert, Button, Card, Chip, Container, Dialog, Spinner, Switch, Tabs, TextField} from "../../ui";
import "./admin.css";

const dateTime = new Intl.DateTimeFormat(undefined, {dateStyle: "medium", timeStyle: "short"});
const fmt = (iso: string) => dateTime.format(new Date(iso));

/** Adds <meta name="robots" content="noindex"> while the admin page is mounted. */
function useNoIndex() {
    useEffect(() => {
        const meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = "noindex, nofollow";
        document.head.appendChild(meta);
        const title = document.title;
        document.title = "Admin";
        return () => {
            meta.remove();
            document.title = title;
        };
    }, []);
}

type AuthState = "loading" | "signedOut" | "signedIn" | "unavailable";

export default function AdminPage() {
    useNoIndex();
    const [auth, setAuth] = useState<AuthState>("loading");

    useEffect(() => {
        getMe()
            .then((me) => setAuth(me.authenticated ? "signedIn" : "signedOut"))
            .catch(() => setAuth("unavailable"));
    }, []);

    if (auth === "loading") {
        return <div className="admin-center"><Spinner/></div>;
    }
    if (auth === "unavailable") {
        // Same as any unknown page: don't confirm the admin area exists.
        return (
            <Container size="sm" className="admin-center">
                <h1 className="t-h2">Page not found</h1>
                <Button href="/">Go home</Button>
            </Container>
        );
    }
    if (auth === "signedOut") return <Login onSignedIn={() => setAuth("signedIn")}/>;
    return <Dashboard onSignedOut={() => setAuth("signedOut")}/>;
}

function Login({onSignedIn}: {onSignedIn: () => void}) {
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await login(password);
            setPassword("");
            onSignedIn();
        } catch (err) {
            setError(err instanceof AdminError ? err.message : "Sign-in failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Container size="xs" className="admin-login">
            <Card as="form" pad="lg" raised onSubmit={submit} className="admin-login__card">
                <h1 className="t-h3">Admin sign in</h1>
                <TextField
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    autoFocus
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="solid" disabled={busy || !password}>
                    {busy ? "Signing in…" : "Sign in"}
                </Button>
            </Card>
        </Container>
    );
}

const ACTIVITY_COLORS: Record<ActivityEvent["type"], "error" | "warning" | "success" | "primary"> = {
    blocked: "error",
    rejected: "warning",
    signed: "success",
    admin: "primary",
};

const TOGGLE_LABELS: Record<string, string> = {guestbook: "Guestbook"};

function Dashboard({onSignedOut}: {onSignedOut: () => void}) {
    const [filter, setFilter] = useState<EntryFilter>("all");
    const [entries, setEntries] = useState<AdminEntry[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activity, setActivity] = useState<ActivityEvent[]>([]);
    const [toggles, setToggles] = useState<Toggle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<AdminEntry | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const handleError = useCallback((err: unknown) => {
        if (err instanceof AdminError && err.status === 401) return onSignedOut();
        setError(err instanceof AdminError ? err.message : "Something went wrong.");
    }, [onSignedOut]);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [s, e, a, t] = await Promise.all([getStats(), getEntries(filter), getActivity(), getToggles()]);
            setStats(s);
            setEntries(e.entries);
            setHasMore(e.hasMore);
            setActivity(a.events);
            setToggles(t.toggles);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }, [filter, handleError]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const loadMore = async () => {
        try {
            const page = await getEntries(filter, entries[entries.length - 1]?.id);
            setEntries((prev) => [...prev, ...page.entries]);
            setHasMore(page.hasMore);
        } catch (err) {
            handleError(err);
        }
    };

    const run = async (id: string, action: () => Promise<unknown>) => {
        setBusyId(id);
        try {
            await action();
            await refresh();
        } catch (err) {
            handleError(err);
        } finally {
            setBusyId(null);
        }
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        const entry = pendingDelete;
        setPendingDelete(null);
        run(entry.id, () => deleteEntry(entry.id));
    };

    const signOut = async () => {
        try {
            await logout();
        } finally {
            onSignedOut();
        }
    };

    return (
        <Container size="lg" className="admin">
            <div className="admin__top">
                <h1 className="t-h1 grow">Admin</h1>
                <Button onClick={refresh} disabled={loading}>Refresh</Button>
                <Button variant="outline" onClick={signOut}>Sign out</Button>
            </div>

            {error && <Alert severity="error" className="admin__error">{error}</Alert>}

            {stats && (
                <div className="admin__stats">
                    {[
                        ["Total entries", stats.total],
                        ["Visible", stats.visible],
                        ["Hidden", stats.hidden],
                        ["Last 24 h", `${stats.last24h} / ${stats.dailyCap}`],
                    ].map(([label, value]) => (
                        <Card key={label}>
                            <div className="t-small t-muted">{label}</div>
                            <div className="admin__stat-value">{value}</div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="admin__layout">
                <div>
                    <div className="admin__section-head">
                        <h2 className="t-h4">Guestbook</h2>
                        <Tabs<EntryFilter>
                            label="Filter entries"
                            value={filter}
                            onChange={setFilter}
                            options={[
                                {value: "all", label: "All"},
                                {value: "visible", label: "Visible"},
                                {value: "hidden", label: "Hidden"},
                            ]}
                        />
                    </div>
                    {loading && entries.length === 0 && <Spinner size={24}/>}
                    {!loading && entries.length === 0 && <p className="t-muted">No entries.</p>}
                    <div className="admin__entries">
                        {entries.map((entry) => (
                            <Card as="article" key={entry.id} className={entry.hidden ? "card--muted" : undefined}>
                                <div className="admin__entry-head">
                                    <span className="t-bold">{entry.name}</span>
                                    {entry.hidden && <Chip>Hidden</Chip>}
                                    <span className="t-small t-muted grow">{fmt(entry.createdAt)}</span>
                                    {entry.visitor && (
                                        <span className="t-caption t-faint t-mono" title="Hashed visitor id">{entry.visitor}</span>
                                    )}
                                </div>
                                <p className="t-pre">{entry.message}</p>
                                <div className="admin__entry-actions">
                                    <Button size="sm" onClick={() => run(entry.id, () => setHidden(entry.id, !entry.hidden))} disabled={busyId === entry.id}>
                                        {entry.hidden ? "Unhide" : "Hide"}
                                    </Button>
                                    <Button size="sm" color="danger" onClick={() => setPendingDelete(entry)} disabled={busyId === entry.id}>
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {hasMore && <div className="t-center" style={{marginTop: 16}}><Button onClick={loadMore}>Load more</Button></div>}
                </div>

                <aside className="admin__side">
                    <section>
                        <h2 className="t-h4 admin__side-title">Feature toggles</h2>
                        <Card pad="none" className="admin__toggles">
                            {toggles.map((t) => (
                                <div key={t.key} className="admin__toggle">
                                    <div className="grow">
                                        <div className="t-bold">{TOGGLE_LABELS[t.key] ?? t.key}</div>
                                        <div className="t-caption t-muted">{t.description}</div>
                                        <div className="t-caption t-faint">
                                            {t.stored ? (t.updatedAt ? `Updated ${fmt(t.updatedAt)}` : "Set in database") : "Default (no document yet)"}
                                        </div>
                                    </div>
                                    <Switch
                                        label={`${TOGGLE_LABELS[t.key] ?? t.key} enabled`}
                                        checked={t.enabled}
                                        disabled={busyId === `toggle:${t.key}`}
                                        onChange={(enabled) => run(`toggle:${t.key}`, () => setToggle(t.key, enabled))}
                                    />
                                </div>
                            ))}
                            {toggles.length === 0 && <p className="t-muted" style={{padding: 16}}>No toggles.</p>}
                        </Card>
                    </section>

                    <section>
                        <h2 className="t-h4 admin__side-title">Recent activity</h2>
                        <p className="t-caption t-muted admin__side-note">Kept in memory; clears when the server restarts.</p>
                        <Card pad="none" className="admin__activity">
                            {activity.length === 0 && <p className="t-muted" style={{padding: 16}}>Nothing yet.</p>}
                            {activity.map((ev, i) => (
                                <div key={i} className="admin__event">
                                    <div className="row" style={{gap: 8}}>
                                        <Chip color={ACTIVITY_COLORS[ev.type]}>{ev.type}</Chip>
                                        <span className="t-caption t-muted">{fmt(ev.at)}</span>
                                    </div>
                                    <p className="t-small" style={{marginTop: 4, overflowWrap: "anywhere"}}>{ev.detail}</p>
                                    {ev.visitor && <span className="t-caption t-faint t-mono">{ev.visitor}</span>}
                                </div>
                            ))}
                        </Card>
                    </section>
                </aside>
            </div>

            <Dialog
                open={Boolean(pendingDelete)}
                onClose={() => setPendingDelete(null)}
                title="Delete this entry?"
                actions={<>
                    <Button color="neutral" onClick={() => setPendingDelete(null)}>Cancel</Button>
                    <Button color="danger" variant="solid" onClick={confirmDelete}>Delete permanently</Button>
                </>}
            >
                “{pendingDelete?.message}” by {pendingDelete?.name} will be permanently deleted. This can’t be undone,
                and the visitor will be able to sign again. To remove it but keep them from re-signing, use Hide instead.
            </Dialog>
        </Container>
    );
}
