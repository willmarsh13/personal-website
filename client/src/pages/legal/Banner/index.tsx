import React, {useState, useEffect} from "react";
import {Button, Card} from "../../../ui";

export const PRIVACY_ACCEPTED_EVENT = "privacy:accepted";
export const PRIVACY_STORAGE_KEY = "privacyBannerAccepted";

const PrivacyBanner: React.FC = () => {
    const STORAGE_KEY = PRIVACY_STORAGE_KEY;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem(STORAGE_KEY);
        if (!accepted) setOpen(true);
    }, [STORAGE_KEY]);

    const handleAccept = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setOpen(false);
        window.dispatchEvent(new Event(PRIVACY_ACCEPTED_EVENT));
    };

    if (!open) return null;

    return (
        <Card as="aside" raised aria-label="Privacy notice" className="floating-card floating-card--left">
            <p style={{fontWeight: 700, marginBottom: 8}}>
                {`We value your privacy`}
            </p>
            <p className="t-small t-muted" style={{marginBottom: 12}}>
                We don't sell any personal data on this site.
                <br/>
                <br/>
                {`Please review our `}
                <a href="/legal#privacy_policy">
                    {`Privacy Policy`}
                </a>
                {` and `}
                <a href="/legal#terms_of_service">
                    {`Terms of Service`}
                </a>
                {` to learn more.`}
            </p>
            <div style={{textAlign: "right"}}>
                <Button size="sm" variant="solid" onClick={handleAccept}>
                    Got it
                </Button>
            </div>
        </Card>
    );
};

export default PrivacyBanner;
