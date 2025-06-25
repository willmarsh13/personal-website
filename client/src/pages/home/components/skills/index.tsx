import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import React from "react";


export default function Skills() {

    const skills = [
        'React',
        'TypeScript',
        'Node.js',
        'Express',
        'MongoDB',
        'MUI',
        'PostgreSQL',
        'Docker',
    ];

    return (
        <Paper elevation={3} sx={{p: 4, mt: 8}}>
            <Typography variant="h6" gutterBottom>
                Skills & Technologies
            </Typography>
            <Divider sx={{mb: 2}}/>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                {skills.map((skill) => (
                    <Chip key={skill} label={skill} color="primary" variant="outlined" onClick={() => null}/>
                ))}
            </Stack>
        </Paper>
    )
}