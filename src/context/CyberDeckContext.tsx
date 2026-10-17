import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  VFSNode,
  ProcessItem,
  Mission,
  CommandHistoryItem,
  RigSettings,
  Theme,
  TelemetryMetrics
} from '../types';
import { createInitialVFS } from '../services/vfs';
import { INITIAL_MISSIONS, INITIAL_PROCESSES } from '../services/missions';
import { executeCommand } from '../services/commands';
import { soundEngine } from '../services/audio';

const STORAGE_KEY_VFS = 'cyberdeck_vfs_v2';
const STORAGE_KEY_PROCESSES = 'cyberdeck_procs_v2';
const STORAGE_KEY_MISSIONS = 'cyberdeck_missions_v2';
const STORAGE_KEY_SETTINGS = 'cyberdeck_settings_v2';
const STORAGE_KEY_HISTORY = 'cyberdeck_history_v2';

const DEFAULT_SETTINGS: RigSettings = {
  theme: 'phosphor',
  scanlines: true,
  vignette: true,
  glow: 60,
  soundEnabled: true,
  keyClickEnabled: true,
  ambientHumEnabled: false,
  matrixRain: false,
};

interface CyberDeckContextType {
  vfs: VFSNode;
  cwd: string;
  processes: ProcessItem[];
  missions: Mission[];
  history: CommandHistoryItem[];
  rawHistory: string[];
  settings: RigSettings;
  telemetry: TelemetryMetrics;
  uptime: number;
  runCommand: (input: string) => void;
  submitFlagDirect: (flag: string) => { success: boolean; message: string };
  updateSettings: (partial: Partial<RigSettings>) => void;
  resetRig: () => void;
  triggerTelemetrySpike: () => void;
  clearHistory: () => void;
}

const CyberDeckContext = createContext<CyberDeckContextType | undefined>(undefined);

export const CyberDeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with localStorage fallbacks
  const [vfs, setVfs] = useState<VFSNode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VFS);
      return saved ? JSON.parse(saved) : createInitialVFS();
    } catch {
      return createInitialVFS();
    }
  });

  const [cwd, setCwd] = useState<string>('/home/operator');

  const [processes, setProcesses] = useState<ProcessItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROCESSES);
      return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
    } catch {
      return INITIAL_PROCESSES;
    }
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MISSIONS);
      return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  });

  const [settings, setSettings] = useState<RigSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [rawHistory, setRawHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [uptime, setUptime] = useState<number>(0);

  // Live telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryMetrics>({
    cpu: 18.4,
    memory: 24.2,
    network: 12.0,
  });

  const spikeTimerRef = useRef<number | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VFS, JSON.stringify(vfs));
    } catch {}
  }, [vfs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROCESSES, JSON.stringify(processes));
    } catch {}
  }, [processes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(missions));
    } catch {}
  }, [missions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(rawHistory.slice(-50)));
    } catch {}
  }, [rawHistory]);

  // Sync document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Audio mute sync
  useEffect(() => {
    soundEngine.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Ambient hum sync
  useEffect(() => {
    soundEngine.toggleAmbientHum(settings.ambientHumEnabled && settings.soundEnabled);
  }, [settings.ambientHumEnabled, settings.soundEnabled]);

  // Uptime ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Telemetry real-time loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if rogue process exists
      const hasRogue = processes.some((p) => p.isRogue || p.command.includes('xmrig'));
      const baselineCpu = hasRogue ? 88.0 : 14.0;
      const baselineMem = hasRogue ? 36.5 : 22.0;

      setTelemetry((prev) => {
        // Natural jitter around baseline
        const jitterCpu = (Math.random() - 0.5) * 4.5;
        const jitterMem = (Math.random() - 0.5) * 1.5;
        const jitterNet = (Math.random() - 0.5) * 6.0;

        const targetCpu = Math.min(99.9, Math.max(5.0, baselineCpu + jitterCpu));
        const targetMem = Math.min(99.0, Math.max(10.0, baselineMem + jitterMem));
        const targetNet = Math.min(100.0, Math.max(4.0, (hasRogue ? 45.0 : 12.0) + jitterNet));

        // Smooth transition
        return {
          cpu: +(prev.cpu * 0.7 + targetCpu * 0.3).toFixed(1),
          memory: +(prev.memory * 0.8 + targetMem * 0.2).toFixed(1),
          network: +(prev.network * 0.6 + targetNet * 0.4).toFixed(1),
        };
      });
    }, 400);

    return () => clearInterval(interval);
  }, [processes]);

  const triggerTelemetrySpike = useCallback(() => {
    if (spikeTimerRef.current) clearTimeout(spikeTimerRef.current);

    setTelemetry((prev) => ({
      cpu: Math.min(99.5, prev.cpu + 28),
      memory: Math.min(99.0, prev.memory + 4.5),
      network: Math.min(100, prev.network + 55),
    }));
  }, []);

  const updateSettings = useCallback((partial: Partial<RigSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const resetRig = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_VFS);
    localStorage.removeItem(STORAGE_KEY_PROCESSES);
    localStorage.removeItem(STORAGE_KEY_MISSIONS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_HISTORY);

    const freshVfs = createInitialVFS();
    const freshProcs = [...INITIAL_PROCESSES];
    const freshMissions = INITIAL_MISSIONS.map((m) => ({ ...m, isUnlocked: m.id === 1, isCompleted: false }));

    setVfs(freshVfs);
    setCwd('/home/operator');
    setProcesses(freshProcs);
    setMissions(freshMissions);
    setSettings(DEFAULT_SETTINGS);
    setRawHistory([]);
    setHistory([]);
    soundEngine.playFanfare();
  }, []);

  const submitFlagDirect = useCallback((flag: string): { success: boolean; message: string } => {
    const trimmed = flag.trim();
    const matched = missions.find((m) => m.flag.toLowerCase() === trimmed.toLowerCase());

    if (!matched) {
      soundEngine.playError();
      return { success: false, message: `Flag '${trimmed}' rejected. Incorrect signature.` };
    }

    if (matched.isCompleted) {
      return { success: true, message: `Flag '${trimmed}' already recorded for ${matched.code}.` };
    }

    // Complete mission
    const updated = missions.map((m) => {
      if (m.id === matched.id) return { ...m, isCompleted: true, isUnlocked: true };
      if (m.id === matched.id + 1) return { ...m, isUnlocked: true };
      return m;
    });

    setMissions(updated);
    soundEngine.playFanfare();
    triggerTelemetrySpike();

    return { success: true, message: `Access Authorized! [${matched.code}] ${matched.title} completed!` };
  }, [missions, triggerTelemetrySpike]);

  const runCommand = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add to raw command history
    setRawHistory((prev) => [...prev, trimmed]);

    // Check sounds
    if (settings.soundEnabled && settings.keyClickEnabled) {
      soundEngine.playEnterKey();
    }

    // Execute command with clones to maintain state immutability
    const vfsClone = JSON.parse(JSON.stringify(vfs));
    const procsClone = JSON.parse(JSON.stringify(processes));
    const missionsClone = JSON.parse(JSON.stringify(missions));

    const result = executeCommand(
      trimmed,
      cwd,
      vfsClone,
      procsClone,
      missionsClone,
      rawHistory,
      (t: Theme) => updateSettings({ theme: t }),
      () => updateSettings({ matrixRain: !settings.matrixRain }),
      resetRig
    );

    // Apply state updates
    setVfs(vfsClone);
    setProcesses(procsClone);
    setMissions(missionsClone);

    if (result.newCwd) {
      setCwd(result.newCwd);
    }

    if (result.triggerTelemetrySpike) {
      triggerTelemetrySpike();
    }

    // Sound triggers
    if (settings.soundEnabled) {
      if (result.audioTrigger === 'fanfare') {
        soundEngine.playFanfare();
      } else if (result.audioTrigger === 'kill') {
        soundEngine.playProcessTerminated();
      } else if (result.audioTrigger === 'error') {
        soundEngine.playError();
      }
    }

    if (result.clearRequested) {
      setHistory([]);
      return;
    }

    const newItem: CommandHistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      command: trimmed,
      cwd: cwd,
      timestamp: new Date().toLocaleTimeString(),
      outputType: result.outputType,
      outputContent: result.outputContent,
    };

    setHistory((prev) => [...prev, newItem]);
  }, [cwd, vfs, processes, missions, rawHistory, settings, triggerTelemetrySpike, updateSettings, resetRig]);

  return (
    <CyberDeckContext.Provider
      value={{
        vfs,
        cwd,
        processes,
        missions,
        history,
        rawHistory,
        settings,
        telemetry,
        uptime,
        runCommand,
        submitFlagDirect,
        updateSettings,
        resetRig,
        triggerTelemetrySpike,
        clearHistory,
      }}
    >
      {children}
    </CyberDeckContext.Provider>
  );
};

export const useCyberDeck = (): CyberDeckContextType => {
  const context = useContext(CyberDeckContext);
  if (!context) {
    throw new Error('useCyberDeck must be used within a CyberDeckProvider');
  }
  return context;
};
