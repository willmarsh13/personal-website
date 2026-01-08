import React, {useState, useEffect} from "react";
import {Box, Typography, Button, Link, Paper} from "@mui/material";

const PrivacyBanner: React.FC = () => {
    const STORAGE_KEY = "privacyBannerAccepted";
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem(STORAGE_KEY);
        if (!accepted) setOpen(true);
    }, []);

    const handleAccept = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setOpen(false);
    };

    if (!open) return null;

    return (
        <Paper
            elevation={6}
            sx={{
                position: "fixed",
                bottom: 16,
                left: 16,
                width: 300,
                p: 2,
                borderRadius: 2,
                zIndex: 1500,
            }}
        >
            <Typography variant="subtitle1" gutterBottom>
                <b>{`We value your privacy`}</b>
            </Typography>
            <Typography variant="body2" sx={{mb: 1}}>
                We don't sell any personal data on this site.
                <br/>
                <br/>
                {`Please review our `}
                <Link href="/legal#privacy_policy" underline="hover">
                    {`Privacy Policy`}
                </Link>
                {` and `}
                <Link href="/legal#terms_of_service" underline="hover">
                    {`Terms of Service`}
                </Link>
                {` to learn more.`}
            </Typography>
            <Box sx={{textAlign: "right"}}>
                <Button size="small" variant="contained" onClick={handleAccept}>
                    Got it
                </Button>
            </Box>
        </Paper>
    );
};

export default PrivacyBanner;
