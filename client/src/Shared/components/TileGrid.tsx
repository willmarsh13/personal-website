// TileGrid.tsx
import React from 'react';
import { Box, useTheme } from '@mui/material';

export default function TileGrid() {
    const theme = useTheme();

    const tileSize = 400; // px
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    const cols = Math.ceil(screenWidth / tileSize);
    const rows = Math.ceil(screenHeight / tileSize);

    const tiles = Array.from({ length: cols * rows }, (_, i) => i);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                pointerEvents: 'none',
            }}
        >
            {tiles.map((tile) => (
                <Box
                    key={tile}
                    sx={{
                        width: '100%',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        pointerEvents: 'auto',
                        '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#ddd',
                            border: `1px solid ${theme.palette.divider}`,
                        },
                    }}
                />
            ))}
        </Box>
    );
}
