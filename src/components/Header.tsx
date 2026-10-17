import React from 'react';
import { useCyberDeck } from '../context/CyberDeckContext';
import { Terminal, Shield, Cpu, Volume2, VolumeX, Radio, RotateCcw, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { uptime, missions, settings, updateSettings, resetRig } = useCyberDeck();

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / missions.length) * 100);

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <header className="h-14 border-b border-cyber-border bg-cyber-card/90 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none text-xs font-mono">
      {/* Brand & Node Identity */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-cyber-primary">
          <Terminal className="w-5 h-5 animate-pulse" />
          <span className="font-bold tracking-widest text-sm uppercase text-cyber-primary glow-text">
            CyberDeck<span className="text-cyber-secondary font-light">OS</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyber-primaryDim text-cyber-primary font-semibold border border-cyber-border">
            v4.2-PRO
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-cyber-muted pl-3 border-l border-cyber-border/60">
          <Radio className="w-3.5 h-3.5 text-cyber-success animate-pulse" />
          <span>NET:</span>
          <span className="text-cyber-text font-semibold">10.13.37.42</span>
          <span className="text-[10px] text-cyber-success">[LINK OK]</span>
        </div>
      </div>

      {/* Center status info */}
      <div className="hidden lg:flex items-center space-x-6 text-cyber-muted">
        <div className="flex items-center space-x-2">
          <span>UPTIME:</span>
          <span className="text-cyber-text font-mono tracking-wider">{formatUptime(uptime)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-cyber-primary" />
          <span>SECURITY LAB:</span>
          <span className="text-cyber-primary font-semibold">
            {completedCount}/{missions.length} SOLVED ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2">
        {/* Matrix Rain Toggle */}
        <button
          onClick={() => updateSettings({ matrixRain: !settings.matrixRain })}
          title="Toggle Digital Rain"
          className={`px-2 py-1 rounded flex items-center space-x-1 border text-[11px] transition-colors ${
            settings.matrixRain
              ? 'border-cyber-primary text-cyber-primary bg-cyber-primaryDim'
              : 'border-cyber-border text-cyber-muted hover:text-cyber-text hover:border-cyber-primary/50'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">MATRIX</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          title={settings.soundEnabled ? 'Mute Audio Synthesizer' : 'Unmute Audio Synthesizer'}
          className={`p-1.5 rounded border transition-colors ${
            settings.soundEnabled
              ? 'border-cyber-primary/60 text-cyber-primary bg-cyber-primaryDim'
              : 'border-cyber-border text-cyber-muted hover:text-cyber-text'
          }`}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reset Rig button */}
        <button
          onClick={() => {
            if (window.confirm('Factory Reset CyberDeck? This will restore files, process table, and CTF missions.')) {
              resetRig();
            }
          }}
          title="Reset Rig to Default State"
          className="p-1.5 rounded border border-cyber-border text-cyber-muted hover:text-cyber-danger hover:border-cyber-danger/60 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
