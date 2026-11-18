import { configureStore } from '@reduxjs/toolkit';
import themeReducer, {THEME_STORAGE_KEY} from './reducers/themeReducer';

export const store = configureStore({
    reducer: {
        theme: themeReducer,
    },
});

// Remember the theme so it carries across pages and visits.
let lastMode = store.getState().theme.mode;
store.subscribe(() => {
    const mode = store.getState().theme.mode;
    if (mode === lastMode) return;
    lastMode = mode;
    try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
        /* storage unavailable: theme just won't persist */
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
