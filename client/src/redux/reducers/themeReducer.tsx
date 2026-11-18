import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {ThemeState} from "../../Interfaces/appInterfaces";

export const THEME_STORAGE_KEY = 'theme';

/** The visitor's saved choice (set via the terminal's `theme` command), else dark. */
function savedMode(): 'light' | 'dark' {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch {
        return 'dark';
    }
}

const initialState: ThemeState = {
    mode: savedMode(),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setMode: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.mode = action.payload;
        },
        toggleMode: (state) => {
            state.mode = state.mode === 'dark' ? 'light' : 'dark';
        },
    },
});

export const { setMode, toggleMode } = themeSlice.actions;
export default themeSlice.reducer;
