import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './redux/store';
import App from './App';
import { SnackbarProvider, closeSnackbar, SnackbarKey } from 'notistack';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemedApp />
        </Provider>
    </React.StrictMode>
);

function ThemedApp() {
    const mode = useSelector((state: RootState) => state.theme.mode);
    const theme = createTheme({ palette: { mode } });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider
                maxSnack={3}
                dense
                autoHideDuration={2000}
                action={(snackbarKey: SnackbarKey) => (
                    <SnackbarCloseButton snackbarKey={snackbarKey} />
                )}
            >
                <App />
            </SnackbarProvider>
        </ThemeProvider>
    );
}

function SnackbarCloseButton({ snackbarKey }: { snackbarKey: SnackbarKey }) {
    return (
        <IconButton onClick={() => closeSnackbar(snackbarKey)}>
            <CloseIcon />
        </IconButton>
    );
}
