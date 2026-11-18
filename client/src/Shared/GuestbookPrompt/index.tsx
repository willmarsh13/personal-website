import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {SIGNED_STORAGE_KEY} from "../../api/guestbook";
import {PRIVACY_ACCEPTED_EVENT, PRIVACY_STORAGE_KEY} from "../../pages/legal/Banner";
import {scrollToSection} from "../scrollToSection";
import {useFeatures} from "../features";
import {Button, Card, CloseIcon, IconButton} from "../../ui";

const PROMPTED_KEY = "guestbook:prompted";
const DELAY_MS = 4000;

function read(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function markPrompted(): boolean {
    try {
        localStorage.setItem(PROMPTED_KEY, "1");
        return true;
    } catch {
        return false; // can't remember we asked, so don't ask at all
    }
}

/**
 * First-visit nudge: "Welcome! Want to sign the guestbook?" Shown once per
 * browser, after the privacy banner is out of the way, never to someone who
 * has already signed, and never while the guestbook toggle is off.
 */
export default function GuestbookPrompt() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const {guestbook: enabled} = useFeatures();
    const excluded = pathname.startsWith("/admin") || !enabled;

    useEffect(() => {
        if (excluded || read(PROMPTED_KEY) || read(SIGNED_STORAGE_KEY)) return;

        let timer: ReturnType<typeof setTimeout> | undefined;
        const schedule = () => {
            timer = setTimeout(() => {
                if (read(PROMPTED_KEY) || read(SIGNED_STORAGE_KEY)) return;
                if (markPrompted()) setOpen(true);
            }, DELAY_MS);
        };

        if (read(PRIVACY_STORAGE_KEY)) {
            schedule();
            return () => clearTimeout(timer);
        }
        // Don't stack on top of the privacy banner; wait until it's dismissed.
        window.addEventListener(PRIVACY_ACCEPTED_EVENT, schedule, {once: true});
        return () => {
            window.removeEventListener(PRIVACY_ACCEPTED_EVENT, schedule);
            clearTimeout(timer);
        };
    }, [excluded]);

    if (excluded || !open) return null;

    const signIt = () => {
        setOpen(false);
        if (pathname !== "/") navigate("/");
        scrollToSection("guestbook", () => {
            // Focus once the smooth scroll has had time to land.
            setTimeout(() => document.getElementById("guestbook-name")?.focus({preventScroll: true}), 600);
        });
    };

    return (
        <Card as="aside" raised role="dialog" aria-labelledby="guestbook-prompt-title" className="floating-card floating-card--right">
            <div className="row" style={{alignItems: "flex-start"}}>
                <h2 id="guestbook-prompt-title" className="grow" style={{fontSize: "1rem", fontWeight: 650}}>
                    👋 Welcome!
                </h2>
                <IconButton size="sm" onClick={() => setOpen(false)} aria-label="Dismiss" style={{margin: "-4px -6px 0 0"}}>
                    <CloseIcon size={16}/>
                </IconButton>
            </div>
            <p className="t-small t-muted" style={{margin: "6px 0 16px"}}>
                Thanks for stopping by. Want to sign the guestbook?
            </p>
            <div className="row" style={{justifyContent: "flex-end", gap: 8}}>
                <Button size="sm" color="neutral" onClick={() => setOpen(false)}>Maybe later</Button>
                <Button size="sm" variant="solid" onClick={signIt}>Sign it</Button>
            </div>
        </Card>
    );
}
