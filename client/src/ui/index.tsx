/*
 * Small in-house component set that replaces MUI. Styling lives in ui.css;
 * these components only map props to class names and handle behavior.
 */
import React, {useEffect, useId, useRef} from "react";
import {createPortal} from "react-dom";
import {AlertCircleIcon, CheckCircleIcon, InfoIcon} from "./icons";
import "./ui.css";

export * from "./icons";

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

// ---------------------------------------------------------------- Layout
type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl";
export function Container({size = "lg", className, ...rest}: React.HTMLAttributes<HTMLDivElement> & {size?: ContainerSize}) {
    return <div className={cx("container", `container--${size}`, className)} {...rest}/>;
}

// ---------------------------------------------------------------- Card
type CardProps = React.HTMLAttributes<HTMLElement> & {
    as?: "div" | "article" | "section" | "form" | "aside";
    pad?: "none" | "md" | "lg";
    interactive?: boolean;
    raised?: boolean;
};
export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
    {as: Tag = "div", pad = "md", interactive, raised, className, ...rest}, ref,
) {
    return React.createElement(Tag, {
        ref,
        className: cx("card", pad === "md" && "card--pad", pad === "lg" && "card--pad-lg",
            interactive && "card--interactive", raised && "card--raised", className),
        ...rest,
    });
});

// ---------------------------------------------------------------- Buttons
type ButtonVariant = "text" | "solid" | "outline";
type ButtonColor = "primary" | "secondary" | "success" | "danger" | "neutral";
type ButtonBase = {variant?: ButtonVariant; color?: ButtonColor; size?: "sm" | "md"; startIcon?: React.ReactNode};
type ButtonProps = ButtonBase & (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & {href?: undefined})
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & {href: string})
);

export function Button({variant = "text", color = "primary", size = "md", startIcon, className, children, ...rest}: ButtonProps) {
    const classes = cx("btn", variant !== "text" && `btn--${variant}`, color !== "primary" && `btn--${color}`,
        size === "sm" && "btn--sm", className);
    const content = <>{startIcon}{children}</>;
    if ("href" in rest && rest.href !== undefined) {
        const {target, rel, ...anchor} = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
        return (
            <a className={classes} target={target} rel={target === "_blank" ? rel ?? "noopener noreferrer" : rel} {...anchor}>
                {content}
            </a>
        );
    }
    const button = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return <button type={button.type ?? "button"} className={classes} {...button}>{content}</button>;
}

export function IconButton({size = "md", className, ...rest}: React.ButtonHTMLAttributes<HTMLButtonElement> & {size?: "sm" | "md"}) {
    return <button type="button" className={cx("icon-btn", size === "sm" && "icon-btn--sm", className)} {...rest}/>;
}

// ---------------------------------------------------------------- Chip
export function Chip({color, className, children}: {color?: "primary" | "success" | "warning" | "error"; className?: string; children: React.ReactNode}) {
    return <span className={cx("chip", color && `chip--${color}`, className)}>{children}</span>;
}

// ---------------------------------------------------------------- Text field
type FieldProps = {
    label: string;
    help?: React.ReactNode;
    counter?: {value: number; max: number};
    required?: boolean;
    multiline?: boolean;
    rows?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, "rows">;

export function TextField({label, help, counter, required, multiline, rows = 3, id, className, ...rest}: FieldProps) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const helpId = `${fieldId}-help`;
    const describedBy = help || counter ? helpId : undefined;
    return (
        <div className={cx("field", className)}>
            <label className="field__label" htmlFor={fieldId}>
                {label}{required && <span className="req" aria-hidden="true">*</span>}
            </label>
            {multiline ? (
                <textarea id={fieldId} className="field__input" rows={rows} required={required} aria-describedby={describedBy}
                          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}/>
            ) : (
                <input id={fieldId} className="field__input" required={required} aria-describedby={describedBy}
                       {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}/>
            )}
            {(help || counter) && (
                <div className="field__help" id={helpId}>
                    <span>{help}</span>
                    {counter && <span>{counter.value}/{counter.max}</span>}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------- Alert
const ALERT_ICONS = {success: CheckCircleIcon, error: AlertCircleIcon, warning: AlertCircleIcon, info: InfoIcon};
export function Alert({severity, children, className}: {severity: keyof typeof ALERT_ICONS; children: React.ReactNode; className?: string}) {
    const Icon = ALERT_ICONS[severity];
    return (
        <div className={cx("alert", `alert--${severity}`, className)} role={severity === "error" ? "alert" : "status"}>
            <Icon size={18}/>
            <div className="alert__body">{children}</div>
        </div>
    );
}

// ---------------------------------------------------------------- Spinner
export function Spinner({size = 28, label = "Loading"}: {size?: number; label?: string}) {
    return <span className="spinner" role="progressbar" aria-label={label} style={{"--size": `${size}px`} as React.CSSProperties}/>;
}

// ---------------------------------------------------------------- Overlay / Dialog
type OverlayProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    center?: boolean;
    labelledBy?: string;
    /** Return focus to whatever was focused before opening (default true). */
    restoreFocus?: boolean;
};

/** Portal + backdrop + Escape/backdrop-click to close + focus containment. */
export function Overlay({open, onClose, children, center, labelledBy, restoreFocus = true}: OverlayProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;
        const previous = document.activeElement as HTMLElement | null;
        const {overflow} = document.body.style;
        document.body.style.overflow = "hidden";

        const panel = panelRef.current;
        const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []);
        if (!panel?.contains(document.activeElement)) (panel?.querySelector<HTMLElement>("[autofocus]") ?? focusables()[0] ?? panel)?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onCloseRef.current();
            } else if (e.key === "Tab") {
                const items = focusables();
                if (!items.length) return;
                const first = items[0], last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
            if (restoreFocus) previous?.focus?.({preventScroll: true});
        };
    }, [open, restoreFocus]);

    if (!open) return null;
    return createPortal(
        <div className={cx("overlay", center && "overlay--center")} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} style={{outline: "none", width: "100%", display: "contents"}}>
                {children}
            </div>
        </div>,
        document.body,
    );
}

export function Dialog({open, onClose, title, children, actions}: {
    open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; actions: React.ReactNode;
}) {
    const titleId = useId();
    return (
        <Overlay open={open} onClose={onClose} center labelledBy={titleId}>
            <div className="dialog">
                <h2 className="dialog__title" id={titleId}>{title}</h2>
                <div className="t-small t-muted">{children}</div>
                <div className="dialog__actions">{actions}</div>
            </div>
        </Overlay>
    );
}

// ---------------------------------------------------------------- Tabs
export function Tabs<T extends string>({value, onChange, options, label}: {
    value: T; onChange: (v: T) => void; options: Array<{value: T; label: string}>; label: string;
}) {
    return (
        <div className="tabs" role="tablist" aria-label={label}>
            {options.map((o) => (
                <button key={o.value} type="button" role="tab" className="tabs__tab"
                        aria-selected={o.value === value} onClick={() => onChange(o.value)}>
                    {o.label}
                </button>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------- Switch
export function Switch({checked, onChange, label, disabled}: {checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean}) {
    return (
        <span className="switch">
            <input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled}
                   onChange={(e) => onChange(e.target.checked)}/>
            <span className="switch__track"/>
            <span className="switch__thumb"/>
        </span>
    );
}

// ---------------------------------------------------------------- Media query
export function useMediaQuery(query: string) {
    const get = () => typeof window !== "undefined" && window.matchMedia(query).matches;
    const [matches, setMatches] = React.useState(get);
    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);
    return matches;
}
