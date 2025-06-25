import {Box, Button, Card, CardActionArea, CardActions, CardContent, Divider, Grid, Typography} from "@mui/material";
import React from "react";


export default function Projects() {

    const projects = [
        {
            title: 'PetFinder AI',
            description:
                'An ML project to classify dog and cat breeds from images using a CNN model and a Python backend.',
            link: '#',
        },
        {
            title: 'Portfolio Site',
            description:
                'The very site you’re viewing now! Built with React and MUI for a responsive, theme-aware experience.',
            link: '#',
        },
    ];

    return (
        <Box sx={{mt: 8}}>
            <Typography variant="h6" gutterBottom>
                Projects
            </Typography>
            <Divider sx={{mb: 3}}/>
            <Grid container spacing={3}>
                {projects.map((project, i) => (
                    <Grid size={{xs: 12, md: 6}} key={i}>
                        <Card elevation={2} >
                            <CardActionArea>
                                <CardContent>
                                    <Typography variant="h6">{project.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {project.description}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" href={project.link} disabled>
                                        View Project
                                    </Button>
                                </CardActions>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}