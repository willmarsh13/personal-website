import React, {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import {Provider, useSelector} from 'react-redux';
import {store, RootState} from './redux/store';
import App from './App';
import StarField from "./Shared/components/StarField";
import "./ui/ui.css";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemedApp/>
        </Provider>
    </React.StrictMode>
);

function ThemedApp() {
    const mode = useSelector((state: RootState) => state.theme.mode);

    // Colors are CSS variables keyed off <html data-theme>; see ui/ui.css.
    useEffect(() => {
        document.documentElement.dataset.theme = mode;
    }, [mode]);

    return (
        <>
            <StarField/>
            <App/>
        </>
    );
}
