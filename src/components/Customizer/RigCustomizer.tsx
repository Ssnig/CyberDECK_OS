import React from 'react';
import { useCyberDeck } from '../../context/CyberDeckContext';
import { TelemetryPanel } from '../Telemetry/TelemetryPanel';
import { Theme } from '../../types';
import { Sliders, Palette, Tv, Volume2, RotateCcw, Check } from 'lucide-react';

const THEMES: { id: Theme; name: string; desc: string; colors: string[] }[] = [
  {
    id: 'phosphor',
    name: 'Phosphor Green',
    desc: 'Classic Matrix green CRT',
    colors: ['#00ff66', '#030a05'],
  },
  {
    id: 'amber',
    name: 'Amber CRT',
    desc: 'Warm 1980s monochrome phosphor',
    colors: ['#ffb000', '#0a0600'],
  },
  {
    id: 'synthwave',
    name: 'Synthwave Cyber',
    desc: 'Neon magenta and cyan retrogrid',
    colors: ['#ff007f', '#00f0ff', '#070314'],
  },
  {
    id: 'mica',
    name: 'Win11 Mica Dark',
    desc: 'Fluent slate with cyber cyan accents',
    colors: ['#38bdf8', '#0b1120'],
  },
];

export const RigCustomizer: React.FC = () => {
  const { settings, updateSettings, resetRig } = useCyberDeck();

  return (
    <div className="flex flex-col h-full bg-cyber-bg/95 border border-cyber-border rounded-lg shadow-glow-border overflow-hidden font-mono text-xs select-none">
      {/* Panel Header */}
      <div className="h-9 px-3 bg-cyber-card border-b border-cyber-border flex items-center justify-between">
        <div className="flex items-center space-x-2 text-cyber-primary">
          <Sliders className="w-4 h-4 text-cyber-primary" />
          <span className="font-bold tracking-wider uppercase text-[11px] glow-text">
            Rig Customizer & Telemetry
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Real-time Telemetry Section */}
        <div>
          <div className="text-[10px] text-cyber-muted font-bold uppercase mb-1.5 flex items-center justify-between">
            <span>Hardware Telemetry Streams</span>
            <span className="text-cyber-success text-[9px] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-ping inline-block" />
              <span>LIVE (60 FPS)</span>
            </span>
          </div>
          <TelemetryPanel />
        </div>

        {/* Theme Palette Switcher */}
        <div className="pt-2 border-t border-cyber-border/40">
          <div className="text-[10px] text-cyber-muted font-bold uppercase mb-2 flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5 text-cyber-primary" />
            <span>Deck Display Theme</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => {
              const isSelected = settings.theme === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id })}
                  className={`p-2 rounded border text-left transition-all relative ${
                    isSelected
                      ? 'border-cyber-primary bg-cyber-primaryDim/30 glow-border'
                      : 'border-cyber-border/60 bg-black/40 hover:border-cyber-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-cyber-text truncate">
                      {t.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyber-primary shrink-0" />}
                  </div>

                  <div className="flex space-x-1.5 items-center mt-1.5">
                    {t.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-black/50"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <span className="text-[9px] text-cyber-muted truncate ml-1">{t.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CRT Filters and Display Effects */}
        <div className="pt-2 border-t border-cyber-border/40">
          <div className="text-[10px] text-cyber-muted font-bold uppercase mb-2 flex items-center space-x-1.5">
            <Tv className="w-3.5 h-3.5 text-cyber-secondary" />
            <span>CRT Optics & Shaders</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Scanlines Toggle */}
            <button
              onClick={() => updateSettings({ scanlines: !settings.scanlines })}
              className={`p-2 rounded border flex items-center justify-between transition-colors ${
                settings.scanlines
                  ? 'border-cyber-primary bg-cyber-primaryDim/20 text-cyber-primary'
                  : 'border-cyber-border bg-black/40 text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <span>Scanlines</span>
              <span className="text-[10px] font-bold">
                {settings.scanlines ? '[ENABLED]' : '[OFF]'}
              </span>
            </button>

            {/* Vignette Toggle */}
            <button
              onClick={() => updateSettings({ vignette: !settings.vignette })}
              className={`p-2 rounded border flex items-center justify-between transition-colors ${
                settings.vignette
                  ? 'border-cyber-primary bg-cyber-primaryDim/20 text-cyber-primary'
                  : 'border-cyber-border bg-black/40 text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <span>Vignette Curve</span>
              <span className="text-[10px] font-bold">
                {settings.vignette ? '[ENABLED]' : '[OFF]'}
              </span>
            </button>
          </div>
        </div>

        {/* Audio Synthesizer Toggles */}
        <div className="pt-2 border-t border-cyber-border/40">
          <div className="text-[10px] text-cyber-muted font-bold uppercase mb-2 flex items-center space-x-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyber-accent" />
            <span>Web Audio Synthesizer</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Key clicks toggle */}
            <button
              onClick={() => updateSettings({ keyClickEnabled: !settings.keyClickEnabled })}
              className={`p-2 rounded border flex items-center justify-between transition-colors ${
                settings.keyClickEnabled && settings.soundEnabled
                  ? 'border-cyber-primary bg-cyber-primaryDim/20 text-cyber-primary'
                  : 'border-cyber-border bg-black/40 text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <span>Key Clicks</span>
              <span className="text-[10px] font-bold">
                {settings.keyClickEnabled && settings.soundEnabled ? '[ACTIVE]' : '[MUTED]'}
              </span>
            </button>

            {/* Ambient CRT Hum toggle */}
            <button
              onClick={() => updateSettings({ ambientHumEnabled: !settings.ambientHumEnabled })}
              className={`p-2 rounded border flex items-center justify-between transition-colors ${
                settings.ambientHumEnabled && settings.soundEnabled
                  ? 'border-cyber-primary bg-cyber-primaryDim/20 text-cyber-primary'
                  : 'border-cyber-border bg-black/40 text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <span>60Hz Hum</span>
              <span className="text-[10px] font-bold">
                {settings.ambientHumEnabled && settings.soundEnabled ? '[ACTIVE]' : '[OFF]'}
              </span>
            </button>
          </div>
        </div>

        {/* Reset Rig / Factory Wipe */}
        <div className="pt-2 border-t border-cyber-border/40">
          <button
            onClick={() => {
              if (window.confirm('Reset all mission flags, permissions, and process tables back to initial factory state?')) {
                resetRig();
              }
            }}
            className="w-full py-2 px-3 rounded border border-cyber-border bg-black/60 hover:border-cyber-danger hover:bg-cyber-danger/10 text-cyber-muted hover:text-cyber-danger font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>FACTORY RESET RIG & MISSIONS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
