// TileGrid.tsx
import React from 'react';

export default function TileGrid() {
    const tileSize = 400; // px
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    const cols = Math.ceil(screenWidth / tileSize);
    const rows = Math.ceil(screenHeight / tileSize);

    const tiles = Array.from({ length: cols * rows }, (_, i) => i);

    return (
        <div
            className="tile-grid"
            style={{
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
            <style>{`
                .tile-grid__tile { width: 100%; height: 100%; transition: all 0.3s ease; pointer-events: auto; }
                .tile-grid__tile:hover { background-color: color-mix(in srgb, var(--text) 15%, var(--bg)); border: 1px solid var(--border); }
            `}</style>
            {tiles.map((tile) => (
                <div key={tile} className="tile-grid__tile"/>
            ))}
        </div>
    );
}
