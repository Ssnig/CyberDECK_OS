import React from 'react';
import { useCyberDeck } from '../../context/CyberDeckContext';

export const CrtOverlay: React.FC = () => {
  const { settings } = useCyberDeck();

  return (
    <>
      {/* CRT Scanline Filter */}
      {settings.scanlines && (
        <div className="pointer-events-none fixed inset-0 z-50 crt-scanlines opacity-50 select-none" />
      )}

      {/* Screen Vignette */}
      {settings.vignette && (
        <div className="pointer-events-none fixed inset-0 z-40 crt-vignette opacity-80 select-none" />
      )}
    </>
  );
};
