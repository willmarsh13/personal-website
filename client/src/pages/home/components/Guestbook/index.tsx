import React, {useCallback, useEffect, useState} from "react";
import {Alert, Button, Card, Container, Spinner, TextField} from "../../../../ui";
import {
    fetchEntries,
    fetchSession,
    GuestbookEntry,
    GuestbookError,
    MESSAGE_MAX,
    NAME_MAX,
    signGuestbook,
    SIGNED_STORAGE_KEY,
} from "../../../../api/guestbook";

const SIGNED_KEY = SIGNED_STORAGE_KEY;

function readSignedFlag(): boolean {
    try {
        return localStorage.getItem(SIGNED_KEY) === "1";
    } catch {
        return false;
    }
}

function writeSignedFlag() {
    try {
        localStorage.setItem(SIGNED_KEY, "1");
    } catch {
        /* storage unavailable; the server still enforces one entry */
    }
}

const dateFormat = new Intl.DateTimeFormat(undefined, {dateStyle: "medium"});

export default function Guestbook() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const [token, setToken] = useState<string | null>(null);
    const [alreadySigned, setAlreadySigned] = useState(readSignedFlag());
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [website, setWebsite] = useState(""); // honeypot
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [justSigned, setJustSigned] = useState(false);

    const loadSession = useCallback(async () => {
        try {
            const session = await fetchSession();
            if (session.alreadySigned) {
                setAlreadySigned(true);
                writeSignedFlag();
            } else {
                setAlreadySigned(false);
                setToken(session.token ?? null);
            }
        } catch (err) {
            setFormError(err instanceof GuestbookError ? err.message : "The guestbook is unavailable right now.");
        }
    }, []);

    const loadEntries = useCallback(async (before?: string) => {
        setLoadingEntries(true);
        try {
            const page = await fetchEntries(before);
            setEntries((prev) => (before ? [...prev, ...page.entries] : page.entries));
            setHasMore(page.hasMore);
            setListError(null);
        } catch (err) {
            setListError(err instanceof GuestbookError ? err.message : "Couldn’t load the guestbook.");
        } finally {
            setLoadingEntries(false);
        }
    }, []);

    useEffect(() => {
        loadEntries();
        loadSession();
    }, [loadEntries, loadSession]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || submitting) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const {entry} = await signGuestbook({name, message, token, website});
            setEntries((prev) => [entry, ...prev]);
            setJustSigned(true);
            setAlreadySigned(true);
            writeSignedFlag();
        } catch (err) {
            if (err instanceof GuestbookError) {
                setFormError(err.message);
                if (err.status === 409) {
                    setAlreadySigned(true);
                    writeSignedFlag();
                }
            } else {
                setFormError("Something went wrong. Please try again.");
            }
            // A validation error (400) leaves the token valid so the visitor can
            // edit and resubmit. Anything else used it up; fetch a fresh one.
            if (!(err instanceof GuestbookError && err.status === 400)) {
                setToken(null);
                loadSession();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = Boolean(token) && name.trim().length > 0 && message.trim().length > 0 && !submitting;

    return (
        <Container size="md">
            <header className="guestbook__header">
                <h2 className="t-h2">Guestbook</h2>
                <p>Stopped by? Leave a note. One message per visitor, and keep it friendly.</p>
            </header>

            <Card pad="lg">
                {alreadySigned ? (
                    <Alert severity="success">
                        {justSigned ? "Thanks for signing the guestbook!" : "You’ve already signed the guestbook. Thanks for stopping by!"}
                    </Alert>
                ) : (
                    <form className="guestbook__form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            id="guestbook-name"
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
                            required
                            autoComplete="nickname"
                            maxLength={NAME_MAX}
                            counter={{value: name.length, max: NAME_MAX}}
                        />
                        <TextField
                            label="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                            required
                            multiline
                            rows={3}
                            maxLength={MESSAGE_MAX}
                            counter={{value: message.length, max: MESSAGE_MAX}}
                        />
                        {/* Honeypot: invisible to people, irresistible to bots. */}
                        <div className="honeypot" aria-hidden="true">
                            <label>
                                Leave this empty
                                <input
                                    type="text"
                                    name="website"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </label>
                        </div>
                        {formError && <Alert severity="error">{formError}</Alert>}
                        <div>
                            <Button type="submit" variant="solid" disabled={!canSubmit}>
                                {submitting ? "Signing…" : "Sign the guestbook"}
                            </Button>
                        </div>
                        <p className="t-caption guestbook__fineprint">
                            Your name and message are shown publicly. Links and explicit language aren’t allowed.
                            See the <a href="/legal#privacy_policy">privacy policy</a>.
                        </p>
                    </form>
                )}
            </Card>

            {listError && <Alert severity="warning" className="guestbook__list-error">{listError}</Alert>}

            <div className="guestbook__entries">
                {entries.map((entry) => (
                    <Card as="article" key={entry.id}>
                        <p className="t-pre">{entry.message}</p>
                        <p className="t-small guestbook__entry-meta">
                            — {entry.name} · {dateFormat.format(new Date(entry.createdAt))}
                        </p>
                    </Card>
                ))}
                {!loadingEntries && !listError && entries.length === 0 && (
                    <p className="t-muted t-center">No entries yet. Be the first!</p>
                )}
            </div>

            <div className="t-center" style={{marginTop: 24}}>
                {loadingEntries ? (
                    <Spinner/>
                ) : (
                    hasMore && (
                        <Button onClick={() => loadEntries(entries[entries.length - 1]?.id)}>Load more</Button>
                    )
                )}
            </div>
        </Container>
    );
}
