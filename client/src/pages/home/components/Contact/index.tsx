import {Box, Typography, useTheme} from "@mui/material";
import React from "react";
import {EMAILS, mailto} from "../../../../Shared/emails";


export default function Contact() {
    const theme = useTheme();

    return (
        <>
            <Box textAlign="center" mt={6}>
                <Typography variant="body1" color="text.secondary">
                    Get in touch:
                </Typography>
                <Typography variant="body1" sx={{mt: 1}}>
                    <a
                        href={mailto(EMAILS.me)}
                        style={{
                            textDecoration: 'none',
                            color: theme.palette.primary.main,
                            fontWeight: 500,
                        }}
                    >
                        {EMAILS.me}
                    </a>
                </Typography>
            </Box>
        </>
    )
}
