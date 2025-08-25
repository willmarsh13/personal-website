import {
    Box,
    Button,
    Card,
    CardContent, Chip,
    Container,
    Grid,
    Typography
} from "@mui/material";
import React from "react";
import {project} from "../../index";


export default function Projects({ projects }: { projects: project[] }) {

    return (
        <Box sx={{py: 10, backgroundColor: 'background.default'}}>
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight="medium" gutterBottom>
                    Featured Projects
                </Typography>
                <Grid container spacing={4}>
                    {projects.map((project:project, idx:number) => (
                        <Grid size={{xs: 12, md: 6}} key={idx}>
                            <Card variant="outlined"
                                  sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                <CardContent sx={{flexGrow: '1 !important'}}>
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
                                </CardContent>
                                <Box display="flex" gap={2} sx={{padding: 2}}>
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
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    )
}