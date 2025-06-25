import React from 'react';
import {
    Box,
    Container,
} from '@mui/material';
import Projects from "./components/projects";
import Skills from "./components/skills";
import Intro from "./components/Intro";
import GitHubCTA from "./components/GitHubCTA";
import Contact from "./components/contact";


export default function Home() {


    return (
        <Box sx={{bgcolor: 'background.default', minHeight: '100vh', py: 8}}>
            <Container maxWidth="md">
                <Intro/>

                <Skills/>

                <Projects/>

                <GitHubCTA />

                <Contact />

            </Container>
        </Box>
    );
}
