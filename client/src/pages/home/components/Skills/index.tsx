import {
    Box,
    Card,
    Container,
    Grid,
    Typography
} from "@mui/material";
import React from "react";
import {DatabaseZap, Gamepad2, LayoutDashboard, Rocket} from "lucide-react";


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

    const boxes = [
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
    ]

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4}>
                {boxes.map((item, i) => (
                    <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
                        <Card variant="outlined" sx={{
                            p: 2,
                            textAlign: 'center',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Box mb={1}>{item.icon}</Box>
                            <Typography fontWeight="bold">{item.title}</Typography>
                            <Box sx={{
                                flexGrow: '1 !important',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Typography variant="body2">{item.desc}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}