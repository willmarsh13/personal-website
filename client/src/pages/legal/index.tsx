import React from "react";
import {Container} from "../../ui";
import "./legal.css";
import {EMAILS, mailto} from "../../Shared/emails";

const EmailLink: React.FC<{ address: string }> = ({address}) => (
    <a href={mailto(address)}>{address}</a>
);

/**
 * ============================
 * CONFIGURATION — UPDATE THESE
 * ============================
 */
const SITE_NAME = "willmarsh.dev";
const OWNER_NAME = "Will Marsh";
const GOVERNING_LAW_STATE = "United States"; // or your state, e.g. "Texas"
const LAST_UPDATED = "November 17, 2026";

const LegalPage: React.FC = () => {
    return (
        <Container size="md" className="legal">
            <h1 className="t-h1 legal__title">
                Privacy Policy & Terms of Service
            </h1>

            <p className="t-small t-muted">
                Last updated: {LAST_UPDATED}
            </p>

            <hr className="divider"/>

            {/* ================= PRIVACY POLICY ================= */}
            <section className="legal__section" id='privacy_policy'>
                <h2 className="t-h2 legal__h2">
                    Privacy Policy
                </h2>

                <p className="legal__p">
                    This Privacy Policy explains how {SITE_NAME} ("we", "us", or "our")
                    collects, uses, and protects your information when you use our
                    website and related services.
                </p>

                <h3 className="t-h4 legal__h3">
                    Information We Collect
                </h3>
                <p className="legal__p">
                    We collect information only as necessary to operate and maintain user
                    accounts and the functionality of the site. This may include:
                </p>

                <ul className="legal__list">
                    <li>
                        <span className="legal__item-primary">Account Information</span><span className="legal__item-secondary">Email address, first name, last name, password (stored in hashed form), and any other information relevant to account operation.</span>
                    </li>
                    <li>
                        <span className="legal__item-primary">Guestbook Entries</span><span className="legal__item-secondary">The name and message you submit, which are displayed publicly, plus a one-way hashed identifier derived from your IP address. The hash is used only to limit each visitor to one entry and to prevent abuse; your raw IP address is not stored with your entry.</span>
                    </li>
                    <li>
                        <span className="legal__item-primary">Technical Information</span><span className="legal__item-secondary">IP address, browser type, device information, and server logs collected automatically for security and operational purposes.</span>
                    </li>
                </ul>

                <h3 className="t-h4 legal__h3">
                    How We Use Your Information
                </h3>
                <p className="legal__p">
                    We use collected information to:
                </p>
                <ul className="legal__list">
                    <li>
                        <span className="legal__item-primary">Create and manage user accounts</span>
                    </li>
                    <li>
                        <span className="legal__item-primary">Provide and maintain site functionality</span>
                    </li>
                    <li>
                        <span className="legal__item-primary">Communicate with users regarding account-related matters</span>
                    </li>
                    <li>
                        <span className="legal__item-primary">Protect the security and integrity of the site</span>
                    </li>
                </ul>

                <h3 className="t-h4 legal__h3">
                    Data Sharing
                </h3>
                <p className="legal__p">
                    We do not sell, rent, or trade your personal information. We may share
                    information only with service providers necessary to operate the site
                    (such as hosting providers) or if required by law.
                </p>

                <h3 className="t-h4 legal__h3">
                    Data Retention
                </h3>
                <p className="legal__p">
                    We retain personal information only for as long as necessary to
                    operate the site, comply with legal obligations, and resolve disputes.
                </p>

                <h3 className="t-h4 legal__h3">
                    Your Rights
                </h3>
                <p className="legal__p">
                    You may request access to or deletion of your personal information by
                    contacting us at <EmailLink address={EMAILS.privacy}/>.
                </p>

                <h3 className="t-h4 legal__h3">
                    Communications
                </h3>
                <p className="legal__p">
                    Account and system emails are sent from <EmailLink address={EMAILS.noreply}/> or{" "}
                    <EmailLink address={EMAILS.notifications}/>. These addresses are not monitored; for
                    help with your account, contact <EmailLink address={EMAILS.support}/>.
                </p>

                <h3 className="t-h4 legal__h3">
                    Children’s Privacy
                </h3>
                <p className="legal__p">
                    This site is not intended for children under the age of 13. We do not
                    knowingly collect personal information from children.
                </p>

                <h3 className="t-h4 legal__h3">
                    Changes to This Policy
                </h3>
                <p className="legal__p">
                    We may update this Privacy Policy from time to time. Changes will be
                    posted on this page with an updated revision date.
                </p>
            </section>

            <hr className="divider"/>

            {/* ================= TERMS OF SERVICE ================= */}
            <section className="legal__section" id='terms_of_service'>
                <h2 className="t-h2 legal__h2">
                    Terms of Service
                </h2>

                <p className="legal__p">
                    By accessing or using {SITE_NAME}, you agree to be bound by these Terms
                    of Service. If you do not agree, you may not use the site.
                </p>

                <h3 className="t-h4 legal__h3">
                    Acceptable Use
                </h3>
                <p className="legal__p">
                    You agree not to use the site for any unlawful, harmful, abusive, or
                    malicious purpose, including but not limited to:
                </p>
                <ul className="legal__list">
                    <li>
                        <span className="legal__item-primary">Violating any applicable laws or regulations</span>
                    </li>
                    <li>
                        <span className="legal__item-primary">Attempting to gain unauthorized access to accounts or systems</span>
                    </li>
                    <li>
                        <span className="legal__item-primary">Harassment, abuse, or harm toward others</span>
                    </li>
                    <li>
                        <span className="legal__item-primary">Introducing malware, scraping, or denial-of-service attacks</span>
                    </li>
                </ul>

                <h3 className="t-h4 legal__h3">
                    Reporting Security Issues
                </h3>
                <p className="legal__p">
                    If you discover a security vulnerability, please report it responsibly to{" "}
                    <EmailLink address={EMAILS.security}/> rather than disclosing it publicly.
                </p>

                <h3 className="t-h4 legal__h3">
                    Account Responsibility
                </h3>
                <p className="legal__p">
                    You are responsible for maintaining the confidentiality of your
                    account credentials and for all activity that occurs under your
                    account.
                </p>

                <h3 className="t-h4 legal__h3">
                    Intellectual Property
                </h3>
                <p className="legal__p">
                    All content, code, and materials on this site are owned by or licensed
                    to {OWNER_NAME} and are protected by applicable intellectual property
                    laws. You may not reproduce or redistribute content without permission.
                </p>

                <h3 className="t-h4 legal__h3">
                    External Links
                </h3>
                <p className="legal__p">
                    This site may include links to other websites or pages under the same
                    domain or third-party domains. We are not responsible for the content
                    or practices of external sites.
                </p>

                <h3 className="t-h4 legal__h3">
                    Disclaimer
                </h3>
                <p className="legal__p">
                    The site is provided on an "as is" and "as available" basis. We make no
                    warranties regarding accuracy, reliability, or availability.
                </p>

                <h3 className="t-h4 legal__h3">
                    Limitation of Liability
                </h3>
                <p className="legal__p">
                    To the maximum extent permitted by law, {OWNER_NAME} shall not be
                    liable for any indirect, incidental, or consequential damages arising
                    from your use of the site.
                </p>

                <h3 className="t-h4 legal__h3">
                    Termination
                </h3>
                <p className="legal__p">
                    We reserve the right to suspend or terminate access to the site at our
                    discretion for violations of these Terms.
                </p>

                <h3 className="t-h4 legal__h3">
                    Governing Law
                </h3>
                <p className="legal__p">
                    These Terms are governed by the laws of {GOVERNING_LAW_STATE}, without
                    regard to conflict of law principles.
                </p>

                <h3 className="t-h4 legal__h3">
                    Contact
                </h3>
                <p className="legal__p">
                    If you have questions about these Terms or the Privacy Policy, contact
                    us at <EmailLink address={EMAILS.contact}/>. For privacy requests, use{" "}
                    <EmailLink address={EMAILS.privacy}/>; for billing questions, use{" "}
                    <EmailLink address={EMAILS.billing}/>.
                </p>
            </section>
        </Container>
    );
};

export default LegalPage;
