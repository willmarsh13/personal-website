import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {ThemeState} from "../../Interfaces/appInterfaces";

const initialState: ThemeState = {
    mode: 'dark',
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
