import { VFSNode, ProcessItem, Mission, OutputType } from '../types';
import { getNode, resolvePath, octalToSymbolic, canRead, chmodNode } from './vfs';

export interface CommandExecutionResult {
  outputContent: string;
  outputType: OutputType;
  newCwd?: string;
  clearRequested?: boolean;
  audioTrigger?: 'fanfare' | 'kill' | 'error' | 'click';
  triggerTelemetrySpike?: boolean;
  onMissionCompleted?: (missionId: number) => void;
  onProcessKilled?: (pid: number) => void;
}

export function executeCommand(
  rawInput: string,
  currentCwd: string,
  rootVFS: VFSNode,
  processes: ProcessItem[],
  missions: Mission[],
  commandHistory: string[],
  themeSetter?: (theme: 'phosphor' | 'amber' | 'synthwave' | 'mica') => void,
  matrixToggle?: () => void,
  resetRigCallback?: () => void
): CommandExecutionResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { outputContent: '', outputType: 'text' };
  }

  // Tokenize preserving quotes
  const tokens: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match;
  while ((match = regex.exec(trimmed)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[0]);
  }

  const cmd = tokens[0]?.toLowerCase() || '';
  const args = tokens.slice(1);

  switch (cmd) {
    case 'help': {
      const helpText = `CYBERDECK SHELL COMMAND SUBSYSTEM
--------------------------------------------------------------------------------
COMMAND              DESCRIPTION
--------------------------------------------------------------------------------
help                 Display this list of operational binaries
ls [-la] [path]      List directory contents (with hidden files and permissions)
cd <path>            Navigate directory tree (supports .., ~, /absolute, relative)
pwd                  Print current working directory
cat <file>           Display text content of a file
grep <str> <file>    Filter lines matching pattern inside target file
chmod <mode> <file>  Change file mode permissions (e.g. 'chmod 644 .shadow_note')
ps                   List running processes and resource consumption
kill <pid>           Terminate process by Process ID (PID)
decode <b64_string>  Base64 decoding utility for forensic payloads
submit <flag>        Submit a captured flag string (e.g. FLAG{...})
clear                Wipe terminal screen buffer
whoami               Show current user identifier
uname                Display kernel and hardware deck architecture
theme <name>         Switch theme (phosphor, amber, synthwave, mica)
matrix               Toggle background Matrix digital rain
history              Display session command history
reset-rig            Factory reset deck storage, missions, and memory
--------------------------------------------------------------------------------`;
      return {
        outputContent: helpText,
        outputType: 'help',
        triggerTelemetrySpike: true,
      };
    }

    case 'pwd': {
      return {
        outputContent: currentCwd,
        outputType: 'text',
        triggerTelemetrySpike: false,
      };
    }

    case 'clear':
    case 'cls': {
      return {
        outputContent: '',
        outputType: 'text',
        clearRequested: true,
      };
    }

    case 'cd': {
      const target = args[0] || '~';
      const destination = resolvePath(currentCwd, target);
      const node = getNode(rootVFS, destination);

      if (!node) {
        return {
          outputContent: `cd: ${target}: No such file or directory`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      if (node.type !== 'dir') {
        return {
          outputContent: `cd: ${target}: Not a directory`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      return {
        outputContent: '',
        outputType: 'text',
        newCwd: destination,
        triggerTelemetrySpike: true,
      };
    }

    case 'ls': {
      let showAll = false;
      let longFormat = false;
      let targetPath = '';

      for (const arg of args) {
        if (arg.startsWith('-')) {
          if (arg.includes('a')) showAll = true;
          if (arg.includes('l')) longFormat = true;
        } else if (!targetPath) {
          targetPath = arg;
        }
      }

      const dest = targetPath ? resolvePath(currentCwd, targetPath) : currentCwd;
      const node = getNode(rootVFS, dest);

      if (!node) {
        return {
          outputContent: `ls: cannot access '${targetPath}': No such file or directory`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      if (node.type === 'file') {
        if (longFormat) {
          const sym = octalToSymbolic(node.permissions, false);
          return {
            outputContent: `${sym} 1 ${node.owner} ${node.group} ${node.size.toString().padStart(6)} ${node.updatedAt} ${node.name}`,
            outputType: 'table',
            triggerTelemetrySpike: true,
          };
        }
        return {
          outputContent: node.name,
          outputType: 'text',
          triggerTelemetrySpike: true,
        };
      }

      const children = node.children || {};
      const entries = Object.keys(children).sort((a, b) => a.localeCompare(b));
      const visibleEntries = showAll ? ['.', '..', ...entries] : entries.filter((e) => !e.startsWith('.'));

      if (visibleEntries.length === 0) {
        return { outputContent: '(empty directory)', outputType: 'text' };
      }

      if (!longFormat) {
        // Grid view
        const formatted = visibleEntries.map((name) => {
          if (name === '.' || name === '..') return name;
          const child = children[name];
          return child?.type === 'dir' ? `${name}/` : name;
        }).join('    ');

        return {
          outputContent: formatted,
          outputType: 'text',
          triggerTelemetrySpike: true,
        };
      }

      // Long format: ls -la
      const lines: string[] = [`total ${visibleEntries.length * 4}`];

      for (const name of visibleEntries) {
        if (name === '.') {
          lines.push(`drwxr-xr-x 2 ${node.owner} ${node.group} ${node.size.toString().padStart(6)} ${node.updatedAt} .`);
        } else if (name === '..') {
          lines.push(`drwxr-xr-x 3 root root   4096 2026-10-17 21:00 ..`);
        } else {
          const item = children[name];
          if (!item) continue;
          const sym = octalToSymbolic(item.permissions, item.type === 'dir');
          const sizeStr = item.size.toString().padStart(6);
          const displayName = item.type === 'dir' ? `${name}/` : name;
          lines.push(`${sym} 1 ${item.owner.padEnd(8)} ${item.group.padEnd(8)} ${sizeStr} ${item.updatedAt} ${displayName}`);
        }
      }

      return {
        outputContent: lines.join('\n'),
        outputType: 'table',
        triggerTelemetrySpike: true,
      };
    }

    case 'cat': {
      if (!args[0]) {
        return {
          outputContent: 'cat: missing file operand\nUsage: cat <file>',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      const filePath = resolvePath(currentCwd, args[0]);
      const node = getNode(rootVFS, filePath);

      if (!node) {
        return {
          outputContent: `cat: ${args[0]}: No such file or directory`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      if (node.type === 'dir') {
        return {
          outputContent: `cat: ${args[0]}: Is a directory`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      if (node.isLocked) {
        return {
          outputContent: node.lockedReason || `cat: ${args[0]}: Permission denied (Resource Locked)`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      if (!canRead(node)) {
        return {
          outputContent: `cat: ${args[0]}: Permission denied (Current mode: ${node.permissions}). Tip: check permissions with 'ls -la' and update using 'chmod'.`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      return {
        outputContent: node.content || '',
        outputType: 'text',
        triggerTelemetrySpike: true,
      };
    }

    case 'chmod': {
      if (args.length < 2) {
        return {
          outputContent: 'chmod: missing operand\nUsage: chmod <mode> <file>\nExample: chmod 644 .shadow_note',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      const mode = args[0];
      const targetFile = args[1];
      const filePath = resolvePath(currentCwd, targetFile);

      const res = chmodNode(rootVFS, filePath, mode);
      if (!res.success) {
        return {
          outputContent: res.message || 'chmod: failed to change permissions',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      return {
        outputContent: `mode of '${targetFile}' changed to ${mode} (${octalToSymbolic(mode, false)})`,
        outputType: 'success',
        triggerTelemetrySpike: true,
      };
    }

    case 'grep': {
      if (args.length < 2) {
        return {
          outputContent: 'grep: missing pattern or file\nUsage: grep <pattern> <file>\nExample: grep "FAILED" auth.log',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      // Check if -i is passed
      let pattern = '';
      let targetFile = '';
      let ignoreCase = false;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-i') {
          ignoreCase = true;
        } else if (!pattern) {
          pattern = args[i];
        } else if (!targetFile) {
          targetFile = args[i];
        }
      }

      if (!targetFile) {
        return {
          outputContent: 'grep: missing target file',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      const filePath = resolvePath(currentCwd, targetFile);
      const node = getNode(rootVFS, filePath);

      if (!node) {
        return {
          outputContent: `grep: ${targetFile}: No such file or directory`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      if (node.type === 'dir') {
        return {
          outputContent: `grep: ${targetFile}: Is a directory`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      if (!canRead(node)) {
        return {
          outputContent: `grep: ${targetFile}: Permission denied`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      const lines = (node.content || '').split('\n');
      const matched = lines.filter((line) => {
        if (ignoreCase) {
          return line.toLowerCase().includes(pattern.toLowerCase());
        }
        return line.includes(pattern);
      });

      if (matched.length === 0) {
        return {
          outputContent: '(no matches found)',
          outputType: 'text',
          triggerTelemetrySpike: true,
        };
      }

      return {
        outputContent: matched.join('\n'),
        outputType: 'text',
        triggerTelemetrySpike: true,
      };
    }

    case 'ps': {
      const header = '  PID USER       %CPU  %MEM COMMAND';
      const rows = processes.map((p) => {
        const pidStr = p.pid.toString().padStart(5);
        const userStr = p.user.padEnd(10);
        const cpuStr = p.cpu.toFixed(1).padStart(5);
        const memStr = p.mem.toFixed(1).padStart(5);
        const alertTag = p.isRogue ? '  [ALERT: ROGUE DETECTED]' : '';
        return `${pidStr} ${userStr} ${cpuStr} ${memStr} ${p.command}${alertTag}`;
      });

      return {
        outputContent: [header, ...rows].join('\n'),
        outputType: 'table',
        triggerTelemetrySpike: true,
      };
    }

    case 'kill': {
      if (!args[0]) {
        return {
          outputContent: 'kill: missing process operand\nUsage: kill <pid>\nExample: kill 4892',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      let pidArg = args[0];
      if (pidArg === '-9' && args[1]) {
        pidArg = args[1];
      }

      const pid = parseInt(pidArg, 10);
      if (isNaN(pid)) {
        return {
          outputContent: `kill: invalid process id: '${pidArg}'`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      const processIndex = processes.findIndex((p) => p.pid === pid);
      if (processIndex === -1) {
        return {
          outputContent: `kill: (${pid}) - No such process`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      const targetProc = processes[processIndex];
      const isRogue = targetProc.isRogue || targetProc.command.includes('xmrig');

      // Remove process
      processes.splice(processIndex, 1);

      if (isRogue) {
        // Unlock /opt/vault/reward.txt
        const rewardNode = getNode(rootVFS, '/opt/vault/reward.txt');
        if (rewardNode) {
          rewardNode.isLocked = false;
        }

        return {
          outputContent: `[SIGKILL] Process ${pid} (${targetProc.command.split(' ')[0]}) terminated.\nDaemon interlock disengaged. Secure vault container /opt/vault/reward.txt is now UNLOCKED.\nSystem telemetry core load normalized.`,
          outputType: 'success',
          audioTrigger: 'kill',
          triggerTelemetrySpike: true,
        };
      }

      return {
        outputContent: `[SIGTERM] Process ${pid} terminated.`,
        outputType: 'text',
        triggerTelemetrySpike: true,
      };
    }

    case 'decode': {
      if (!args[0]) {
        return {
          outputContent: 'decode: missing Base64 string\nUsage: decode <base64_string>\nExample: decode RkxBR3tHUkVQX0RFVEVDVElWRV8wMn0=',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      try {
        const decoded = atob(args[0].trim());
        return {
          outputContent: `DECODED PAYLOAD:\n----------------------------------------\n${decoded}\n----------------------------------------`,
          outputType: 'success',
          triggerTelemetrySpike: true,
        };
      } catch {
        return {
          outputContent: 'decode: invalid Base64 input string or corrupted checksum.',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }
    }

    case 'submit': {
      if (!args[0]) {
        return {
          outputContent: 'submit: missing flag token\nUsage: submit <FLAG{...}>\nExample: submit FLAG{CHMOD_MASTER_01}',
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      const submittedFlag = args[0].trim();

      // Find if matches any mission
      const matchedMission = missions.find((m) => m.flag.toLowerCase() === submittedFlag.toLowerCase());

      if (!matchedMission) {
        return {
          outputContent: `SUBMISSION FAILED: Invalid flag key '${submittedFlag}'. Keep investigating!`,
          outputType: 'error',
          audioTrigger: 'error',
        };
      }

      if (matchedMission.isCompleted) {
        return {
          outputContent: `MISSION ALREADY COMPLETED: Flag '${submittedFlag}' was previously verified.`,
          outputType: 'text',
        };
      }

      // Complete mission!
      matchedMission.isCompleted = true;
      matchedMission.isUnlocked = true;

      // Unlock next mission if available
      const nextMission = missions.find((m) => m.id === matchedMission.id + 1);
      if (nextMission) {
        nextMission.isUnlocked = true;
      }

      const totalCompleted = missions.filter((m) => m.isCompleted).length;
      const allDone = totalCompleted === missions.length;

      const successBanner = `
================================================================================
>>> FLAG ACCEPTED: ${matchedMission.flag} <<<
>>> MISSION ACCOMPLISHED: [${matchedMission.code}] ${matchedMission.title} <<<
================================================================================
${allDone 
  ? 'ALL MISSIONS CLEARED! CyberDeck OS Security Operations Master Status Unlocked.' 
  : `Advancing to next challenge: [${nextMission?.code}] ${nextMission?.title}. Check Mission Control!`}
--------------------------------------------------------------------------------`;

      return {
        outputContent: successBanner,
        outputType: 'success',
        audioTrigger: 'fanfare',
        triggerTelemetrySpike: true,
      };
    }

    case 'whoami': {
      return {
        outputContent: 'operator (uid=1000, gid=1000, groups=1000(operator),27(sudo),110(netdev))',
        outputType: 'text',
      };
    }

    case 'uname': {
      return {
        outputContent: 'Linux cyberdeck-rig 6.8.0-cyberdeck #42-SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
        outputType: 'text',
      };
    }

    case 'date': {
      return {
        outputContent: new Date().toUTCString(),
        outputType: 'text',
      };
    }

    case 'echo': {
      return {
        outputContent: args.join(' '),
        outputType: 'text',
      };
    }

    case 'history': {
      const historyLines = commandHistory.map((cmdStr, idx) => `  ${(idx + 1).toString().padStart(4)}  ${cmdStr}`);
      return {
        outputContent: historyLines.length ? historyLines.join('\n') : '(no command history)',
        outputType: 'text',
      };
    }

    case 'theme': {
      if (!args[0]) {
        return {
          outputContent: 'Available themes: phosphor, amber, synthwave, mica\nUsage: theme <name>',
          outputType: 'text',
        };
      }

      const targetTheme = args[0].toLowerCase() as 'phosphor' | 'amber' | 'synthwave' | 'mica';
      if (['phosphor', 'amber', 'synthwave', 'mica'].includes(targetTheme)) {
        if (themeSetter) themeSetter(targetTheme);
        return {
          outputContent: `Deck display profile switched to [${targetTheme.toUpperCase()}].`,
          outputType: 'success',
        };
      }

      return {
        outputContent: `theme: Unknown theme '${args[0]}'. Choose from: phosphor, amber, synthwave, mica`,
        outputType: 'error',
        audioTrigger: 'error',
      };
    }

    case 'matrix': {
      if (matrixToggle) {
        matrixToggle();
        return {
          outputContent: 'Matrix digital backdrop toggled.',
          outputType: 'success',
        };
      }
      return { outputContent: 'Matrix display toggle unavailable.', outputType: 'error' };
    }

    case 'reset-rig': {
      if (resetRigCallback) {
        resetRigCallback();
        return {
          outputContent: 'RIG FACTORY RESET: All missions, memory, and settings have been restored to factory default.',
          outputType: 'success',
        };
      }
      return { outputContent: 'Reset operation unavailable.', outputType: 'error' };
    }

    default: {
      return {
        outputContent: `cyberdeck-sh: command not found: ${cmd}. Type 'help' for available commands.`,
        outputType: 'error',
        audioTrigger: 'error',
      };
    }
  }
}
