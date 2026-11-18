import React from "react";

/*
 * Inline SVG icons. The Code, LinkedIn, GitHub and Email glyphs are the same
 * Material Icons paths the site used before (Apache-2.0), so the logo and the
 * contact buttons look exactly as they did.
 */
type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const material = (path: string, name: string) => {
    const Icon = ({size = 24, ...props}: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
            <path d={path}/>
        </svg>
    );
    Icon.displayName = name;
    return Icon;
};

const stroke = (children: React.ReactNode, name: string) => {
    const Icon = ({size = 24, ...props}: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
            {children}
        </svg>
    );
    Icon.displayName = name;
    return Icon;
};

export const CodeIcon = material("M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6z", "CodeIcon");
export const LinkedInIcon = material("M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z", "LinkedInIcon");
export const GitHubIcon = material("M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27", "GitHubIcon");
export const EmailIcon = material("M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z", "EmailIcon");

export const CloseIcon = stroke(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>, "CloseIcon");
export const MenuIcon = stroke(<><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>, "MenuIcon");
export const TerminalIcon = stroke(<><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 10 3 2-3 2"/><path d="M13 15h4"/></>, "TerminalIcon");
export const CheckCircleIcon = stroke(<><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>, "CheckCircleIcon");
export const AlertCircleIcon = stroke(<><circle cx="12" cy="12" r="9"/><path d="M12 8v4.5"/><path d="M12 16h.01"/></>, "AlertCircleIcon");
export const InfoIcon = stroke(<><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></>, "InfoIcon");
export const ExternalIcon = stroke(<><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>, "ExternalIcon");
