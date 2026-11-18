import React from "react";
import {EMAILS, mailto} from "../../../../Shared/emails";


export default function Contact() {
    return (
        <div className="t-center" style={{marginTop: 48}}>
            <p className="t-muted">
                Get in touch:
            </p>
            <p style={{marginTop: 8}}>
                <a href={mailto(EMAILS.me)} style={{textDecoration: 'none', color: 'var(--primary)', fontWeight: 500}}>
                    {EMAILS.me}
                </a>
            </p>
        </div>
    )
}
