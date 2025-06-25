import {Box, Grid, Typography} from "@mui/material";
import React from "react";
const DeveloperSVG = "/assets/developer.svg";

export default function Intro() {

    return (
        <>
            <Grid container spacing={4} alignItems="center" justifyContent="center">
                <Grid size={{xs: 12, md: 6}}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Hi, I'm Will Marsh
                    </Typography>
                    <Typography variant="h5" color="text.secondary">
                        Full-stack developer crafting clean, scalable, and delightful web apps.
                    </Typography>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <Box
                        component="img"
                        src={DeveloperSVG}
                        alt="Developer illustration"
                        sx={{width: '100%', maxHeight: 300}}
                    />
                </Grid>
            </Grid>
        </>
    )

}