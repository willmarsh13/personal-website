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
        name: 'Athena Analytics',
        description: 'A web app that shows analytics across multiple metrics and levels of detail.',
        tech: ['React', 'MUI', 'Node.js'],
        liveDemo: '',
        repo: '',
    },
    {
        name: 'Catan Board Generator',
        description: 'A generator for randomized, fair Catan boards deployed on a personal website.',
        tech: ['React', 'Tailwind', 'Canvas'],
        liveDemo: '',
        repo: '',
    },
    // Add more projects here...
];

export default function HomePage() {
    const [experience, setExperience] = useState(getYearsOfExperience());
    const clumpContainerRef = useRef<HTMLDivElement>(null);
    const [bounds, setBounds] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            setExperience(getYearsOfExperience());
        }, 1000 * 60 * 60 * 24);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const resize = () => {
            if (clumpContainerRef.current) {
                const rect = clumpContainerRef.current.getBoundingClientRect();
                setBounds({ width: rect.width, height: rect.height });
            }
        };

        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <Box>
            {/* Hero Section */}
            <Grid container>
                <Grid size={{xs: 12, lg: 6}}>
                    <Box sx={{py: 10, backgroundColor: 'background.default', color: 'text.primary'}}>
                        <Container maxWidth="lg">
                            <Typography variant="h2" fontWeight="bold" gutterBottom>
                                Will Marsh
                            </Typography>
                            <Typography variant="h5" maxWidth="md">
                                Sr. Software Engineer focused on crafting intuitive data visualizations, dashboards, and
                                game interfaces, grounded in strong UI/UX and robust backend architecture.
                            </Typography>
                        </Container>
                    </Box>
                </Grid>
                <Grid size={{xs: 12, lg: 6}} height='50vh' position='relative' ref={clumpContainerRef} sx={{border: '1px solid white'}}>
                    <ThreeScene />
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
                                desc: 'Engaging interfaces rooted in accessibility and polish.'
                            },
                            {
                                icon: <DatabaseZap/>,
                                title: 'Backend Architecture',
                                desc: 'Scalable, efficient, and secure APIs and DB design.'
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
