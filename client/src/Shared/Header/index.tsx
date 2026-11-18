import * as React from 'react';
import {pages} from "../../App";
import {openTerminal} from "../Terminal";
import {CloseIcon, CodeIcon, IconButton, MenuIcon, TerminalIcon} from "../../ui";
import "./header.css";

export default function Header() {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close the mobile menu on outside click or Escape.
    React.useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);

    return (
        <header className="site-header">
            <div className="site-header__inner">
                {/* Desktop logo */}
                <a href="/" className="site-header__brand">
                    <CodeIcon className="site-header__logo-icon"/>
                    <span>Will Marsh</span>
                </a>

                {/* Mobile menu */}
                <div className="site-header__mobile-menu" ref={menuRef}>
                    <IconButton aria-label="Open navigation menu" aria-expanded={menuOpen} aria-controls="mobile-nav"
                                onClick={() => setMenuOpen((o) => !o)}>
                        {menuOpen ? <CloseIcon/> : <MenuIcon/>}
                    </IconButton>
                    {menuOpen && (
                        <nav id="mobile-nav" className="site-header__dropdown">
                            {pages.filter((pg) => pg.showInNavBar).map(({id, link, name}) => (
                                <a key={id} href={link}>{name}</a>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Mobile wordmark */}
                <a href="/" className="site-header__wordmark">WILL MARSH</a>

                <nav className="site-header__nav" aria-label="Main">
                    {pages.filter((page) => page.showOnHeader).map(({id, link, name}) => (
                        <a key={id} href={link} aria-current={window.location.pathname === link ? "page" : undefined}>{name}</a>
                    ))}
                </nav>

                <span data-tooltip="Open terminal ( ` or Ctrl+K )">
                    <IconButton onClick={openTerminal} aria-label="Open terminal">
                        <TerminalIcon/>
                    </IconButton>
                </span>
            </div>
        </header>
    );
}
