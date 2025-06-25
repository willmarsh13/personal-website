import {Button, Paper, Typography} from "@mui/material";
import React from "react";


export default function GitHubCTA() {

    return (
        <>
            <Paper elevation={0} sx={{mt: 10, textAlign: 'center', py: 6}}>
                <Typography variant="h6" gutterBottom>
                    Want to see more?
                </Typography>
                <Typography variant="body1" sx={{mb: 2}}>
                    My GitHub has more side projects, experiments, and contributions.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    href="https://github.com/willmarsh13"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit My GitHub
                </Button>
            </Paper>
        </>
    )
}