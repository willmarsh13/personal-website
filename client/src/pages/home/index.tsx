import {Box, Container, Typography, Grid, Paper, Card} from '@mui/material';
import {useEffect, useRef, useState} from 'react';
import React from 'react';
import ThreeScene from "./components/ThreeScene";
import Intro from "./components/Intro";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import SocialMedia from "./components/SocialMedia";

const startDate = new Date('2020-01-01');
const getYearsOfExperience = () => {
    const now = new Date();
    const years = now.getFullYear() - startDate.getFullYear();
    const hasHadAnniversary =
        now.getMonth() > startDate.getMonth() ||
        (now.getMonth() === startDate.getMonth() && now.getDate() >= startDate.getDate());
    return hasHadAnniversary ? years : years - 1;
};

export interface project {
    name: string,
    description: string,
    tech: string[],
    liveDemo: string,
    repo: string,
}

const projects: project[] = [
    {
        name: 'Custom Home Automation',
        description: 'A web app running locally on a Raspberry Pi with custom ground-up authentication to control smart devices via Govee API.',
        tech: ['React', 'MUI', 'Node.js', 'MongoDB'],
        liveDemo: '',
        repo: '',
    },
    {
        name: 'Catan Board Generator',
        description: 'A generator for randomized, fair Catan boards deployed on a personal website.',
        tech: ['React', 'Tailwind'],
        liveDemo: '',
        repo: '',
    },
    {
        name: 'Personal Website',
        description: 'The website you are on now! A playground for me to try new tech and deploy new solutions.',
        tech: ['React', 'TypeScript', 'MongoDB', 'AWS'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/personal-website',
    },
    {
        name: 'Dodge The Creeps',
        description: 'My first attempt at video game design. Avoid the Aliens and try to beat your high score!',
        tech: ['GoDot'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/DodgeTheCreeps',
    },
    {
        name: 'Machine Learning Tetris Solver',
        description: 'Using Machine Learning, I beat my personal Tetris record!',
        tech: ['Java'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/TetrisAI',
    },
    {
        name: 'Bookstore Demo',
        description: 'A sample UI/UX for an online bookstore. Created as a part of my masters curriculum.',
        tech: ['Java', 'Gradle', 'TypeScript', 'HTML', 'CSS'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/BookstoreDemo',
    },
    {
        name: 'Fancy Gallery Android App',
        description: 'An Android OS app built to display images in recycler containers in addition to pinning pictures to coordinates on a map.',
        tech: ['Java', 'Kotlin', 'XML'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/FancyGallery',
    },
    {
        name: 'ML Dog Breed Image Classifier',
        description: 'Find out what breed your dog is based on physical characteristics.',
        tech: ['Java', 'Kotlin', 'XML'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/MLDogBreedClassifier',
    },
];

export default function HomePage() {
    const [experience, setExperience] = useState(getYearsOfExperience());
    const clumpContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setExperience(getYearsOfExperience());
        }, 1000 * 60 * 60 * 24);
        return () => clearInterval(timer);
    }, []);

    return (
        <Box>
            {/* Hero Section */}
            <Grid container>
                <Grid size={{xs: 12, lg: 6}}>
                    <Intro/>
                </Grid>
                <Grid size={{xs: 12, lg: 6}} height='50vh' position='relative' ref={clumpContainerRef}>
                    <ThreeScene/>
                    <Typography variant='body2' maxWidth='md' paddingTop={2} align='center'>
                        Click and drag to play with the engine!
                    </Typography>
                </Grid>
            </Grid>

            <Box sx={{pb: 8, pt: 15, backgroundColor: 'transparent'}}>
                <Container maxWidth="lg">
                    <Grid container spacing={2} justifyContent="center">
                        <Grid>
                            <Card variant="outlined" sx={{padding: 1, height: '100%', display: 'flex', flexDirection: 'column'}}>
                                <Typography variant="h3" fontWeight="bold" textAlign="center">
                                    {experience}+
                                </Typography>
                                <Typography variant="body1" textAlign="center">
                                    Years of Experience
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid>
                            <Card variant="outlined" sx={{padding: 1, height: '100%', display: 'flex', flexDirection: 'column'}}>
                                <Typography variant="h3" fontWeight="bold" textAlign="center">
                                    10+
                                </Typography>
                                <Typography variant="body1" textAlign="center">
                                    Projects Completed
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box height='100%' mx={2}>
                <Paper elevation={0} sx={{height: '100%'}}>
                    <Grid container spacing={4} p={3}>
                        <Grid size={{xs: 12, md: 'auto'}}>
                            <Box
                                component="img"
                                src="/assets/profile.jpg"
                                alt="Will Marsh Headshot"
                                sx={{
                                    width: "100%",
                                    height: "auto",
                                    borderRadius: 2,
                                    display: "block",
                                    maxWidth: 300,
                                    mx: "auto"
                                }}
                            />
                        </Grid>
                        <Grid size={{xs: 12, md: 'grow'}} sx={{display: 'flex', flexDirection: 'column'}}>
                            <Typography variant='h3'>About</Typography>
                            <Typography sx={{flexGrow: '1 !important'}}>
                                Currently, I serve as a Senior Software Engineer at Collins Aerospace, where I am the
                                sole software/infrastructure engineer behind several high-profile projects. We have come
                                to appreciate and value similarity in our technology. By focusing on what web components
                                can signify to users, I have learned how to support multiple parts of the business, all
                                while maintaining a seamless "ecosystem" feel. Many of the applications I have created
                                have hundreds of users, yet no tutorial or demo.
                                <br/><br/>
                                I work across the full stack, building with React on the front end while also managing
                                the infrastructure, deployments, and long-term maintenance in both Azure and AWS
                                environments. What drives me is making complex data and workflows easier to use, with a
                                focus on human-centered design so the technology feels intuitive and supportive for the
                                people relying on it.
                                <br/><br/>
                                <b>Want to learn more? Scroll down or send me an email!</b>
                            </Typography>
                        </Grid>
                    </Grid>

                </Paper>
            </Box>

            {/* Projects Section */}
            <Projects projects={projects}/>

            {/* Highlights Section */}
            <Box sx={{py: 10, backgroundColor: 'transparent'}}>
                <Skills/>
            </Box>

            <Box>
                <SocialMedia/>
            </Box>
        </Box>
    );
}
