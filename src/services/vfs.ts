import { VFSNode } from '../types';

export const createInitialVFS = (): VFSNode => ({
  name: '',
  type: 'dir',
  permissions: '755',
  owner: 'root',
  group: 'root',
  size: 4096,
  updatedAt: '2026-10-17 21:00',
  children: {
    home: {
      name: 'home',
      type: 'dir',
      permissions: '755',
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: '2026-10-17 21:00',
      children: {
        operator: {
          name: 'operator',
          type: 'dir',
          permissions: '755',
          owner: 'operator',
          group: 'operator',
          size: 4096,
          updatedAt: '2026-10-17 21:00',
          children: {
            '.bashrc': {
              name: '.bashrc',
              type: 'file',
              permissions: '644',
              owner: 'operator',
              group: 'operator',
              size: 218,
              updatedAt: '2026-10-17 21:01',
              content: `# CyberDeck Operator Environment\nexport PS1='operator@cyberdeck:\\w$ '\nalias ll='ls -la'\nalias cls='clear'\n# Good luck in the cyber arena.\n`,
            },
            '.shadow_note': {
              name: '.shadow_note',
              type: 'file',
              permissions: '000',
              owner: 'root',
              group: 'root',
              size: 142,
              updatedAt: '2026-10-17 21:02',
              content: `[RESTRICTED DOSSIER // DECK INTEL]\nTarget classified data extracted successfully.\nValidation Key: FLAG{CHMOD_MASTER_01}\nPermission breach verified.\n`,
            },
            'readme.txt': {
              name: 'readme.txt',
              type: 'file',
              permissions: '644',
              owner: 'operator',
              group: 'operator',
              size: 384,
              updatedAt: '2026-10-17 21:00',
              content: `========================================================\n* CYBERDECK OS v4.2-PRO // TACTICAL CONSOLE *\n========================================================\nWelcome, Operator.\nCheck your Mission Control in the upper right panel.\n\nType 'help' to review installed binary commands.\nType 'ls -la' to reveal hidden dotfiles and permissions.\n\nSystem telemetry and audio feedback are active.\n`,
            },
          },
        },
      },
    },
    var: {
      name: 'var',
      type: 'dir',
      permissions: '755',
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: '2026-10-17 21:00',
      children: {
        log: {
          name: 'log',
          type: 'dir',
          permissions: '755',
          owner: 'root',
          group: 'root',
          size: 4096,
          updatedAt: '2026-10-17 21:04',
          children: {
            'auth.log': {
              name: 'auth.log',
              type: 'file',
              permissions: '644',
              owner: 'root',
              group: 'adm',
              size: 1240,
              updatedAt: '2026-10-17 21:04',
              content: `Oct 17 21:00:01 deck CRON[1201]: (root) CMD (/usr/lib/sysstat/sa1 1 1)
Oct 17 21:02:14 deck sshd[3891]: Accepted publickey for operator from 10.13.37.1 port 52210 ssh2
Oct 17 21:03:02 deck sudo: operator : TTY=pts/0 ; PWD=/home/operator ; USER=root ; COMMAND=/usr/bin/dmesg
Oct 17 21:03:45 deck sshd[4102]: Failed password for invalid user admin from 198.51.100.23 port 49112 ssh2
Oct 17 21:04:12 deck sshd[4912]: FAILED login attempt with payload: RkxBR3tHUkVQX0RFVEVDVElWRV8wMn0= from 198.51.100.23
Oct 17 21:04:13 deck sshd[4915]: Connection closed by authenticating user admin 198.51.100.23 port 49112 [preauth]
Oct 17 21:05:00 deck systemd[1]: Started Daily apt upgrade and clean activities.
`,
            },
            'syslog': {
              name: 'syslog',
              type: 'file',
              permissions: '644',
              owner: 'root',
              group: 'adm',
              size: 680,
              updatedAt: '2026-10-17 21:00',
              content: `Oct 17 21:00:00 deck kernel: [ 0.000000] Linux version 6.8.0-cyberdeck (root@core) (gcc-13)
Oct 17 21:00:01 deck systemd[1]: Reached target Graphical Interface.
Oct 17 21:00:02 deck kernel: [ 1.482910] deck_net0: link up 10000Mbps full duplex
Oct 17 21:00:05 deck kernel: [ 2.012900] thermal_zone0: core temp nominal (38C)
`,
            },
          },
        },
      },
    },
    etc: {
      name: 'etc',
      type: 'dir',
      permissions: '755',
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: '2026-10-17 21:00',
      children: {
        security: {
          name: 'security',
          type: 'dir',
          permissions: '755',
          owner: 'root',
          group: 'root',
          size: 4096,
          updatedAt: '2026-10-17 21:00',
          children: {
            'firewall.rules': {
              name: 'firewall.rules',
              type: 'file',
              permissions: '640',
              owner: 'root',
              group: 'root',
              size: 190,
              updatedAt: '2026-10-17 21:00',
              content: `# CyberDeck Hardware Firewall Rules\nDEFAULT DROP INBOUND\nALLOW 22/TCP FROM 10.13.37.0/24\nALLOW 80,443/TCP OUTBOUND\nDROP 3333/TCP (KNOWN MINER PROTOCOL)\n`,
            },
            'access.conf': {
              name: 'access.conf',
              type: 'file',
              permissions: '644',
              owner: 'root',
              group: 'root',
              size: 88,
              updatedAt: '2026-10-17 21:00',
              content: `# PAM access control table\n+ : operator : ALL\n+ : root : LOCAL\n- : ALL : ALL\n`,
            },
          },
        },
      },
    },
    opt: {
      name: 'opt',
      type: 'dir',
      permissions: '755',
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: '2026-10-17 21:00',
      children: {
        vault: {
          name: 'vault',
          type: 'dir',
          permissions: '755',
          owner: 'root',
          group: 'root',
          size: 4096,
          updatedAt: '2026-10-17 21:00',
          children: {
            'reward.txt': {
              name: 'reward.txt',
              type: 'file',
              permissions: '644',
              owner: 'root',
              group: 'root',
              size: 312,
              updatedAt: '2026-10-17 21:00',
              isLocked: true,
              lockedReason: 'ACCESS FORBIDDEN: Secure storage vault is intercepted and sealed by a rogue background daemon (high CPU anomaly detected). Terminate rogue process first.',
              content: `********************************************************\n* [CLASSIFIED REWARD CONTAINER // MISSION 3 SUCCESS]   *\n********************************************************\n\nOutstanding work, Operator!\nThe rogue daemon has been terminated and system resources normalized.\n\nVictory Key: FLAG{SYSADMIN_HERO_03}\n\nYou have mastered CyberDeck terminal security and defense.\n`,
            },
          },
        },
      },
    },
  },
});

export function normalizePath(path: string): string {
  if (!path || path === '~') return '/home/operator';
  if (path.startsWith('~/')) path = '/home/operator' + path.slice(1);
  
  const segments = path.split('/').filter(Boolean);
  const resolved: string[] = [];

  for (const seg of segments) {
    if (seg === '.') continue;
    if (seg === '..') {
      if (resolved.length > 0) resolved.pop();
    } else {
      resolved.push(seg);
    }
  }

  return '/' + resolved.join('/');
}

export function resolvePath(cwd: string, target: string): string {
  if (!target || target.trim() === '') return cwd;
  const trimmed = target.trim();

  if (trimmed === '~' || trimmed.startsWith('~/')) {
    return normalizePath(trimmed);
  }

  if (trimmed.startsWith('/')) {
    return normalizePath(trimmed);
  }

  return normalizePath(`${cwd}/${trimmed}`);
}

export function getNode(root: VFSNode, path: string): VFSNode | null {
  const norm = normalizePath(path);
  if (norm === '/' || norm === '') return root;

  const parts = norm.split('/').filter(Boolean);
  let current: VFSNode = root;

  for (const part of parts) {
    if (current.type !== 'dir' || !current.children) return null;
    const child = current.children[part];
    if (!child) return null;
    current = child;
  }

  return current;
}

export function octalToSymbolic(mode: string, isDir: boolean): string {
  // Normalize mode to 3 digits (e.g., "755", "644", "000")
  let clean = mode.slice(-3);
  while (clean.length < 3) clean = '0' + clean;

  const mapDigit = (d: string) => {
    const n = parseInt(d, 10);
    const r = (n & 4) ? 'r' : '-';
    const w = (n & 2) ? 'w' : '-';
    const x = (n & 1) ? 'x' : '-';
    return `${r}${w}${x}`;
  };

  const prefix = isDir ? 'd' : '-';
  return `${prefix}${mapDigit(clean[0])}${mapDigit(clean[1])}${mapDigit(clean[2])}`;
}

export function canRead(node: VFSNode): boolean {
  if (node.permissions === '000') return false;
  const clean = node.permissions.slice(-3);
  const userDigit = parseInt(clean[0] || '0', 10);
  const otherDigit = parseInt(clean[2] || '0', 10);
  return (userDigit & 4) !== 0 || (otherDigit & 4) !== 0;
}

export function chmodNode(root: VFSNode, path: string, modeStr: string): { success: boolean; message?: string } {
  const target = getNode(root, path);
  if (!target) {
    return { success: false, message: `chmod: cannot access '${path}': No such file or directory` };
  }

  // Handle octal numeric modes like "644", "755", "777", "000"
  if (/^[0-7]{3,4}$/.test(modeStr)) {
    target.permissions = modeStr.slice(-3);
    return { success: true };
  }

  // Handle symbolic shortcuts like "+r", "+rw", "+x"
  if (modeStr === '+r' || modeStr === 'u+r' || modeStr === 'a+r') {
    target.permissions = '644';
    return { success: true };
  }

  if (modeStr === '+rw' || modeStr === '777') {
    target.permissions = '777';
    return { success: true };
  }

  return { success: false, message: `chmod: invalid mode: '${modeStr}'. Use octal format like 'chmod 644 <file>'.` };
}
