import React from "react";
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Box, Paper, Typography, Stack, Grid, Button} from "@mui/material";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';

interface socialMedia {
    name: string,
    icon: React.ReactNode,
    URL: string,
    color: any,
}

const socials: socialMedia[] = [
    {
        name: 'LinkedIn',
        icon: <LinkedInIcon/>,
        URL: 'https://www.linkedin.com/in/willmarsh13',
        color: 'secondary',
    },
    {
        name: 'GitHub',
        icon: <GitHubIcon/>,
        URL: 'https://github.com/willmarsh13',
        color: 'success',
    },
    {
        name: 'Email',
        icon: <EmailIcon/>,
        URL: 'mailto:willmarsh13@gmail.com',
        color: 'primary',
    }
]

export default function SocialMedia() {

    const theme = useTheme()
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md')); // True if screen is smaller than 'sm' breakpoint

    return (
        <>
            <Paper elevation={2} sx={{width: '100%'}}>
                <Box width="100%" justifyContent="center" alignItems='center' paddingY={3}>
                    <Grid container alignItems="center" spacing={4}>
                        <Grid size={{xs: 12, md: 6}}>
                            <Typography variant="h5" textAlign={isMediumScreen ? 'center' : 'end'}>Contact
                                me!</Typography>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}} display='flex'
                              justifyContent={isMediumScreen ? 'center' : 'start'}>
                            <Stack spacing={2} width='min-content'>
                                {socials.map((social) => (
                                    <Button startIcon={social.icon} href={social.URL} variant="contained"
                                            color={social.color}>
                                        {social.name}
                                    </Button>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </>
    )

}