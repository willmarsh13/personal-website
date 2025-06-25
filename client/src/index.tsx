import React from 'react';
import ReactDOM, {Root} from 'react-dom/client';
import {SnackbarProvider, closeSnackbar, SnackbarKey} from 'notistack';
import App from './App';
import {IconButton} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme, Theme } from "@mui/material/styles";

const root: Root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const theme: Theme = createTheme({
    palette: {
        mode: 'dark',
    }
})

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <SnackbarProvider maxSnack={3} dense autoHideDuration={2000} action={(snackbarKey:SnackbarKey) => (<SnackbarCloseButton snackbarKey={snackbarKey} />)} >
                <App/>
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>
);

function SnackbarCloseButton({ snackbarKey }: {snackbarKey: SnackbarKey}) {
    return (
        <IconButton onClick={() => closeSnackbar(snackbarKey)}>
            <CloseIcon />
        </IconButton>
    );
}