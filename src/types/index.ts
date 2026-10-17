export type Theme = 'phosphor' | 'amber' | 'synthwave' | 'mica';

export interface VFSNode {
  name: string;
  type: 'file' | 'dir';
  permissions: string; // e.g. "644", "000", "755"
  owner: string;       // e.g. "operator", "root"
  group: string;       // e.g. "operator", "root"
  size: number;
  updatedAt: string;
  content?: string;
  children?: Record<string, VFSNode>;
  isLocked?: boolean;
  lockedReason?: string;
}

export interface ProcessItem {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  command: string;
  isRogue?: boolean;
}

export interface Mission {
  id: number;
  code: string;
  title: string;
  description: string;
  objective: string;
  flag: string;
  hints: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  solutionHint: string;
}

export type OutputType = 'text' | 'error' | 'success' | 'table' | 'ascii' | 'help' | 'banner';

export interface CommandHistoryItem {
  id: string;
  command: string;
  cwd: string;
  timestamp: string;
  outputType: OutputType;
  outputContent: string | React.ReactNode;
}

export interface TelemetryMetrics {
  cpu: number;
  memory: number;
  network: number;
}

export interface RigSettings {
  theme: Theme;
  scanlines: boolean;
  vignette: boolean;
  glow: number;
  soundEnabled: boolean;
  keyClickEnabled: boolean;
  ambientHumEnabled: boolean;
  matrixRain: boolean;
}
