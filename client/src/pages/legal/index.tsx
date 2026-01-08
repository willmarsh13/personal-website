import React from "react";
import {
    Container,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";

/**
 * ============================
 * CONFIGURATION — UPDATE THESE
 * ============================
 */
const SITE_NAME = "willmarsh.dev";
const OWNER_NAME = "Will Marsh";
const CONTACT_EMAIL = "contact@willmarsh.dev"; // update if different
const GOVERNING_LAW_STATE = "United States"; // or your state, e.g. "Texas"
const LAST_UPDATED = "January 6, 2026";

const LegalPage: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h3" gutterBottom>
                Privacy Policy & Terms of Service
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
                Last updated: {LAST_UPDATED}
            </Typography>

            <Divider sx={{ my: 4 }} />

            {/* ================= PRIVACY POLICY ================= */}
            <Box component="section" sx={{ mb: 6 }} id='privacy_policy'>
                <Typography variant="h4" gutterBottom>
                    Privacy Policy
                </Typography>

                <Typography paragraph>
                    This Privacy Policy explains how {SITE_NAME} ("we", "us", or "our")
                    collects, uses, and protects your information when you use our
                    website and related services.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Information We Collect
                </Typography>
                <Typography paragraph>
                    We collect information only as necessary to operate and maintain user
                    accounts and the functionality of the site. This may include:
                </Typography>

                <List>
                    <ListItem>
                        <ListItemText primary="Account Information" secondary="Email address, first name, last name, password (stored in hashed form), and any other information relevant to account operation." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Technical Information" secondary="IP address, browser type, device information, and server logs collected automatically for security and operational purposes." />
                    </ListItem>
                </List>

                <Typography variant="h6" gutterBottom>
                    How We Use Your Information
                </Typography>
                <Typography paragraph>
                    We use collected information to:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="Create and manage user accounts" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Provide and maintain site functionality" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Communicate with users regarding account-related matters" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Protect the security and integrity of the site" />
                    </ListItem>
                </List>

                <Typography variant="h6" gutterBottom>
                    Data Sharing
                </Typography>
                <Typography paragraph>
                    We do not sell, rent, or trade your personal information. We may share
                    information only with service providers necessary to operate the site
                    (such as hosting providers) or if required by law.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Data Retention
                </Typography>
                <Typography paragraph>
                    We retain personal information only for as long as necessary to
                    operate the site, comply with legal obligations, and resolve disputes.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Your Rights
                </Typography>
                <Typography paragraph>
                    You may request access to or deletion of your personal information by
                    contacting us at {CONTACT_EMAIL}.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Children’s Privacy
                </Typography>
                <Typography paragraph>
                    This site is not intended for children under the age of 13. We do not
                    knowingly collect personal information from children.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Changes to This Policy
                </Typography>
                <Typography paragraph>
                    We may update this Privacy Policy from time to time. Changes will be
                    posted on this page with an updated revision date.
                </Typography>
            </Box>

            <Divider sx={{ my: 6 }} />

            {/* ================= TERMS OF SERVICE ================= */}
            <Box component="section" id='terms_of_service'>
                <Typography variant="h4" gutterBottom>
                    Terms of Service
                </Typography>

                <Typography paragraph>
                    By accessing or using {SITE_NAME}, you agree to be bound by these Terms
                    of Service. If you do not agree, you may not use the site.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Acceptable Use
                </Typography>
                <Typography paragraph>
                    You agree not to use the site for any unlawful, harmful, abusive, or
                    malicious purpose, including but not limited to:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="Violating any applicable laws or regulations" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Attempting to gain unauthorized access to accounts or systems" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Harassment, abuse, or harm toward others" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Introducing malware, scraping, or denial-of-service attacks" />
                    </ListItem>
                </List>

                <Typography variant="h6" gutterBottom>
                    Account Responsibility
                </Typography>
                <Typography paragraph>
                    You are responsible for maintaining the confidentiality of your
                    account credentials and for all activity that occurs under your
                    account.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Intellectual Property
                </Typography>
                <Typography paragraph>
                    All content, code, and materials on this site are owned by or licensed
                    to {OWNER_NAME} and are protected by applicable intellectual property
                    laws. You may not reproduce or redistribute content without permission.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    External Links
                </Typography>
                <Typography paragraph>
                    This site may include links to other websites or pages under the same
                    domain or third-party domains. We are not responsible for the content
                    or practices of external sites.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Disclaimer
                </Typography>
                <Typography paragraph>
                    The site is provided on an "as is" and "as available" basis. We make no
                    warranties regarding accuracy, reliability, or availability.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Limitation of Liability
                </Typography>
                <Typography paragraph>
                    To the maximum extent permitted by law, {OWNER_NAME} shall not be
                    liable for any indirect, incidental, or consequential damages arising
                    from your use of the site.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Termination
                </Typography>
                <Typography paragraph>
                    We reserve the right to suspend or terminate access to the site at our
                    discretion for violations of these Terms.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Governing Law
                </Typography>
                <Typography paragraph>
                    These Terms are governed by the laws of {GOVERNING_LAW_STATE}, without
                    regard to conflict of law principles.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Contact
                </Typography>
                <Typography paragraph>
                    If you have questions about these Terms or the Privacy Policy, contact
                    us at {CONTACT_EMAIL}.
                </Typography>
            </Box>
        </Container>
    );
};

export default LegalPage;
