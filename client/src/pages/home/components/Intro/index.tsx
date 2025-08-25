import {Box, Container, Grid, Typography} from "@mui/material";
import React from "react";

export default function Intro() {

    return (
        <>
            <Box sx={{py: 10, backgroundColor: 'background.default', color: 'text.primary', height: '100%'}}>
                <Container maxWidth="lg" sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignContent: 'flex-start',
                    alignItems: 'flex-start',
                    height: '100%'
                }}>
                    <Typography variant="h2" fontWeight="bold" gutterBottom>
                        👋 Hi, I'm Will Marsh
                    </Typography>
                    <Typography variant="h5" maxWidth="md">
                        Senior Software Engineer with expertise in UI/UX and backend systems, focused on
                        building
                        intuitive data visualizations and interactive interfaces.
                    </Typography>
                    <Typography variant="h6" maxWidth="md" paddingTop={2}>
                        Scroll down to see some of my projects!
                    </Typography>
                </Container>
            </Box>
        </>
    )

}