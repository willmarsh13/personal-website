/**
 * Single source of truth for @willmarsh.dev email addresses.
 */
const DOMAIN = "willmarsh.dev";
const at = (user: string) => `${user}@${DOMAIN}`;

export const EMAILS = {
    /** Personal / direct contact */
    me: at("me"),
    /** General inquiries, questions about the Terms */
    contact: at("contact"),
    /** Help with accounts and site functionality */
    support: at("support"),
    /** Privacy and data requests */
    privacy: at("privacy"),
    /** Vulnerability reports (also published in /.well-known/security.txt) */
    security: at("security"),
    /** Payments and invoices */
    billing: at("billing"),
    /** Development / technical collaboration */
    dev: at("dev"),
    /** Project-specific inboxes */
    flyby: at("flyby"),
    shoeperbowl: at("shoeperbowl"),
    /** Outbound-only / infrastructure (not for display) */
    noreply: at("noreply"),
    notifications: at("notifications"),
    dmarc: at("dmarc"),
} as const;

export const mailto = (address: string) => `mailto:${address}`;
