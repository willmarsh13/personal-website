import React, {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store";
import {setMode, toggleMode} from "../../redux/reducers/themeReducer";
import {EMAILS} from "../emails";
import {scrollToSection} from "../scrollToSection";
import {getFeatures} from "../features";
import {CloseIcon, IconButton, Overlay} from "../../ui";
import "./terminal.css";

/** Fire this from anywhere (e.g. a header button) to open the terminal. */
export const OPEN_TERMINAL_EVENT = "terminal:open";
export const openTerminal = () => window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT));

type Line = { kind: "input" | "output" | "error"; text: React.ReactNode };

interface Ctx {
    args: string[];
    print: (text: React.ReactNode, kind?: Line["kind"]) => void;
    clear: () => void;
    close: () => void;
    go: (path: string, hash?: string) => void;
    theme: "light" | "dark";
    setTheme: (mode: "light" | "dark" | "toggle") => void;
    history: string[];
}

interface Command {
    description: string;
    /** Only available while this feature toggle is on. */
    feature?: "guestbook";
    usage?: string;
    run: (ctx: Ctx) => void;
}

const PAGES: Record<string, string> = {home: "/", "~": "/", legal: "/legal"};
const ALL_SECTIONS = ["projects", "skills", "contact", "guestbook"];
/** Sections that exist right now (the guestbook can be toggled off). */
const sections = () => ALL_SECTIONS.filter((s) => s !== "guestbook" || getFeatures().guestbook);
const available = (c: Command) => !c.feature || getFeatures()[c.feature];
const LINKS: Record<string, string> = {
    github: "https://github.com/willmarsh13",
    linkedin: "https://www.linkedin.com/in/willmarsh13",
};
const PUBLIC_EMAILS = ["me", "contact", "support", "privacy", "security", "billing"] as const;

const BANNER = `Welcome to willmarsh.dev — type 'help' to see what you can do.`;

const COMMANDS: Record<string, Command> = {
    help: {
        description: "List available commands",
        run: ({print}) =>
            print(
                <table style={{borderSpacing: "16px 2px", marginLeft: -16}}>
                    <tbody>
                    {Object.entries(COMMANDS)
                        .filter(([, c]) => c.description && available(c))
                        .map(([name, c]) => (
                            <tr key={name}>
                                <td style={{color: "#7ee787", whiteSpace: "nowrap"}}>{c.usage ?? name}</td>
                                <td>{c.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>,
            ),
    },
    ls: {
        description: "List pages and sections",
        run: ({print}) => print(`pages:    ${Object.keys(PAGES).filter((p) => p !== "~").join("  ")}\nsections: ${sections().join("  ")}`),
    },
    cd: {
        description: "Go to a page or section",
        usage: "cd <page>",
        run: ({args, print, go}) => {
            const target = (args[0] ?? "home").replace(/^\/+/, "").toLowerCase() || "home";
            if (target in PAGES) return go(PAGES[target]);
            if (sections().includes(target)) return go("/", target);
            print(`cd: no such page: ${args[0]}`, "error");
        },
    },
    projects: {description: "Jump to my projects", run: ({go}) => go("/", "projects")},
    skills: {description: "Jump to my skills", run: ({go}) => go("/", "skills")},
    guestbook: {description: "Sign the guestbook", feature: "guestbook", run: ({go}) => go("/", "guestbook")},
    contact: {
        description: "Show ways to reach me",
        run: ({print}) =>
            print(
                <>
                    {PUBLIC_EMAILS.map((key) => (
                        <div key={key}>
                            <span style={{display: "inline-block", width: 80, color: "#8b949e"}}>{key}</span>
                            <a href={`mailto:${EMAILS[key]}`} style={{color: "#79c0ff"}}>{EMAILS[key]}</a>
                        </div>
                    ))}
                </>,
            ),
    },
    email: {
        description: "Open an email to me",
        usage: "email [topic]",
        run: ({args, print, close}) => {
            const key = (args[0] ?? "me").toLowerCase() as typeof PUBLIC_EMAILS[number];
            if (!PUBLIC_EMAILS.includes(key)) {
                return print(`email: unknown topic '${args[0]}'. Try: ${PUBLIC_EMAILS.join(", ")}`, "error");
            }
            print(`Opening mail to ${EMAILS[key]}…`);
            window.location.href = `mailto:${EMAILS[key]}`;
            close();
        },
    },
    github: {
        description: "Open my GitHub",
        run: ({print}) => {
            print("Opening GitHub…");
            window.open(LINKS.github, "_blank", "noopener,noreferrer");
        },
    },
    linkedin: {
        description: "Open my LinkedIn",
        run: ({print}) => {
            print("Opening LinkedIn…");
            window.open(LINKS.linkedin, "_blank", "noopener,noreferrer");
        },
    },
    theme: {
        description: "Switch color theme",
        usage: "theme [dark|light]",
        run: ({args, print, theme, setTheme}) => {
            const want = args[0]?.toLowerCase();
            if (want && want !== "dark" && want !== "light") return print("theme: use 'dark' or 'light'", "error");
            setTheme((want as "dark" | "light") ?? "toggle");
            print(`Theme set to ${want ?? (theme === "dark" ? "light" : "dark")}.`);
        },
    },
    whoami: {
        description: "Who is Will?",
        run: ({print}) => print("Will Marsh — web developer. Builds things for the web, the cloud, and the sky."),
    },
    history: {
        description: "Show command history",
        run: ({print, history}) => print(history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join("\n") || "(empty)"),
    },
    date: {description: "", run: ({print}) => print(new Date().toString())},
    echo: {description: "", run: ({args, print}) => print(args.join(" "))},
    pwd: {description: "", run: ({print}) => print(window.location.pathname)},
    sudo: {description: "", run: ({print}) => print("Nice try. This incident will be reported. 🙂", "error")},
    clear: {description: "Clear the screen", run: ({clear}) => clear()},
    exit: {description: "Close the terminal (Esc)", run: ({close}) => close()},
};

const commandNames = () => Object.keys(COMMANDS).filter((name) => available(COMMANDS[name]));
const COMPLETIONS: Record<string, string[]> = {
    cd: [...Object.keys(PAGES).filter((p) => p !== "~"), ...ALL_SECTIONS],
    email: [...PUBLIC_EMAILS],
    theme: ["dark", "light"],
};

function isTypingInField(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export default function Terminal() {
    const [open, setOpen] = useState(false);
    const [lines, setLines] = useState<Line[]>([{kind: "output", text: BANNER}]);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useSelector((state: RootState) => state.theme.mode);

    // Global shortcuts: ` or Ctrl/Cmd+K to toggle, Esc closes (handled by Overlay).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const isToggle = (e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "`" && !isTypingInField(e.target));
            if (!isToggle) return;
            e.preventDefault();
            setOpen((o) => !o);
        };
        const onOpen = () => setOpen(true);
        window.addEventListener("keydown", onKey);
        window.addEventListener(OPEN_TERMINAL_EVENT, onOpen);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener(OPEN_TERMINAL_EVENT, onOpen);
        };
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight});
    }, [lines, open]);

    const close = useCallback(() => setOpen(false), []);

    const go = useCallback(
        (path: string, hash?: string) => {
            setOpen(false);
            navigate(path);
            if (hash) {
                scrollToSection(hash);
            } else {
                window.scrollTo({top: 0});
            }
        },
        [navigate],
    );

    const run = (raw: string) => {
        const trimmed = raw.trim();
        const out: Line[] = [{kind: "input", text: trimmed}];
        let cleared = false;
        if (trimmed) {
            const [name, ...args] = trimmed.split(/\s+/);
            const found = COMMANDS[name.toLowerCase()];
            const command = found && available(found) ? found : undefined;
            const newHistory = [...history, trimmed].slice(-50);
            setHistory(newHistory);
            if (!command) {
                out.push({kind: "error", text: `command not found: ${name}. Type 'help' for a list.`});
            } else {
                command.run({
                    args,
                    print: (text, kind = "output") => out.push({kind, text}),
                    clear: () => {
                        cleared = true;
                    },
                    close,
                    go,
                    theme,
                    setTheme: (mode) => dispatch(mode === "toggle" ? toggleMode() : setMode(mode)),
                    history: newHistory,
                });
            }
        }
        setLines((prev) => (cleared ? [] : [...prev, ...out].slice(-200)));
        setInput("");
        setHistoryIndex(null);
    };

    const complete = () => {
        const parts = input.split(/\s+/);
        const options = parts.length <= 1 ? commandNames() : (COMPLETIONS[parts[0].toLowerCase()] ?? []).filter((o) => o !== "guestbook" || sections().includes(o));
        const partial = (parts[parts.length - 1] ?? "").toLowerCase();
        const matches = options.filter((o) => o.startsWith(partial));
        if (matches.length === 1) {
            parts[parts.length - 1] = matches[0];
            setInput(parts.join(" ") + " ");
        } else if (matches.length > 1) {
            setLines((prev) => [...prev, {kind: "input", text: input}, {kind: "output", text: matches.join("  ")}]);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // Without this, a command that closes the terminal returns focus to the
            // header button and the same Enter press "clicks" it, reopening it.
            e.preventDefault();
            run(input);
        } else if (e.key === "Tab") {
            e.preventDefault();
            complete();
        } else if (e.key === "ArrowUp" && history.length) {
            e.preventDefault();
            const i = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(i);
            setInput(history[i]);
        } else if (e.key === "ArrowDown" && historyIndex !== null) {
            e.preventDefault();
            const i = historyIndex + 1;
            if (i >= history.length) {
                setHistoryIndex(null);
                setInput("");
            } else {
                setHistoryIndex(i);
                setInput(history[i]);
            }
        } else if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            setLines([]);
        }
    };

    const prompt = <span style={{color: "#7ee787"}}>guest@willmarsh.dev:~$&nbsp;</span>;

    return (
        <Overlay open={open} onClose={close} labelledBy="terminal-title">
            <div className="terminal" onClick={() => inputRef.current?.focus()}>
                <div className="terminal__bar">
                    <span className="terminal__dots" aria-hidden="true"><i/><i/><i/></span>
                    <span id="terminal-title" className="terminal__title">guest@willmarsh.dev — terminal</span>
                    <IconButton size="sm" onClick={close} aria-label="Close terminal" className="terminal__close">
                        <CloseIcon size={16}/>
                    </IconButton>
                </div>
                <div ref={scrollRef} className="terminal__screen" role="log" aria-live="polite">
                    {lines.map((line, i) => (
                        <div key={i} className={line.kind === "error" ? "terminal__line terminal__line--error" : "terminal__line"}>
                            {line.kind === "input" && prompt}
                            {line.text}
                        </div>
                    ))}
                    <div className="terminal__input-row">
                        {prompt}
                        <input
                            ref={inputRef}
                            autoFocus
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            aria-label="Terminal command"
                            spellCheck={false}
                            autoCapitalize="off"
                            autoComplete="off"
                            className="terminal__input"
                        />
                    </div>
                </div>
            </div>
        </Overlay>
    );
}
