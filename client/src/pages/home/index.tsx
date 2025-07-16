import {Box, Container, Typography, Button, Grid, Card, CardContent, Chip} from '@mui/material';
import {useEffect, useRef, useState} from 'react';
import {Rocket, LayoutDashboard, Gamepad2, DatabaseZap} from 'lucide-react';
import React from 'react';
import ThreeScene from "./components/ThreeScene";

const startDate = new Date('2020-01-01');
const getYearsOfExperience = () => {
    const now = new Date();
    const years = now.getFullYear() - startDate.getFullYear();
    const hasHadAnniversary =
        now.getMonth() > startDate.getMonth() ||
        (now.getMonth() === startDate.getMonth() && now.getDate() >= startDate.getDate());
    return hasHadAnniversary ? years : years - 1;
};

const projects = [
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
        description: 'Find out what breed your dog is based on physical characteristics',
        tech: ['Java', 'Kotlin', 'XML'],
        liveDemo: '',
        repo: 'https://github.com/willmarsh13/MLDogBreedClassifier',
    },
    // Add more projects here...
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
                    <Box sx={{py: 10, backgroundColor: 'background.default', color: 'text.primary', height: '100%'}}>
                        <Container maxWidth="lg" sx={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignContent: 'flex-start', alignItems: 'flex-start', height: '100%'}}>
                            <Typography variant="h2" fontWeight="bold" gutterBottom>
                                Hi, I'm Will Marsh
                            </Typography>
                            <Typography variant="h5" maxWidth="md">
                                Senior Software Engineer with expertise in UI/UX and backend systems, focused on
                                building
                                intuitive data visualizations and interactive interfaces.
                            </Typography>
                            <Box display='flex' flexGrow='1 !important'/>
                            <Typography variant="h6" maxWidth="md" paddingTop={2}>
                                Scroll down to see some of my projects!
                            </Typography>
                        </Container>
                    </Box>
                </Grid>
                <Grid size={{xs: 12, lg: 6}} height='50vh' position='relative' ref={clumpContainerRef}>
                    <ThreeScene/>
                </Grid>
            </Grid>


            {/* Counters */}
            <Box sx={{py: 8, backgroundColor: 'background.paper'}}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} justifyContent="center">
                        <Grid>
                            <Typography variant="h3" fontWeight="bold" textAlign="center">
                                {experience}+
                            </Typography>
                            <Typography variant="body1" textAlign="center">
                                Years of Experience
                            </Typography>
                        </Grid>
                        <Grid>
                            <Typography variant="h3" fontWeight="bold" textAlign="center">
                                10+
                            </Typography>
                            <Typography variant="body1" textAlign="center">
                                Projects Completed
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Projects Section */}
            <Box sx={{py: 10, backgroundColor: 'background.default'}}>
                <Container maxWidth="lg">
                    <Typography variant="h4" fontWeight="medium" gutterBottom>
                        Featured Projects
                    </Typography>
                    <Grid container spacing={4}>
                        {projects.map((project, idx) => (
                            <Grid size={{xs: 12, md: 6}} key={idx}>
                                <Card variant="outlined" sx={{height: '100%'}}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {project.name}
                                        </Typography>
                                        <Typography variant="body2" mb={2}>
                                            {project.description}
                                        </Typography>
                                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                            {project.tech.map((t, i) => (
                                                <Chip key={i} label={t} size="small"/>
                                            ))}
                                        </Box>
                                        <Box mt={2} display="flex" gap={2}>
                                            {project.liveDemo && (
                                                <Button href={project.liveDemo} target="_blank" variant="contained">
                                                    Live Demo
                                                </Button>
                                            )}
                                            {project.repo && (
                                                <Button href={project.repo} target="_blank" variant="outlined">
                                                    GitHub
                                                </Button>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Highlights Section */}
            <Box sx={{py: 10, backgroundColor: 'background.paper'}}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {[
                            {
                                icon: <Rocket/>,
                                title: 'Rapid Prototyping',
                                desc: 'Fast iterations with solid engineering principles.'
                            },
                            {
                                icon: <LayoutDashboard/>,
                                title: 'Data Dashboards',
                                desc: 'Real-time data visualization and interactive charts.'
                            },
                            {
                                icon: <Gamepad2/>,
                                title: 'Game UI Design',
                                desc: 'Simple, yet engaging interfaces.'
                            },
                            {
                                icon: <DatabaseZap/>,
                                title: 'Backend Architecture',
                                desc: 'Scalable, efficient, and secure APIs with a strong DB design.'
                            },
                        ].map((item, i) => (
                            <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
                                <Card variant="outlined" sx={{p: 2, textAlign: 'center'}}>
                                    <Box mb={1}>{item.icon}</Box>
                                    <Typography fontWeight="bold">{item.title}</Typography>
                                    <Typography variant="body2">{item.desc}</Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}
