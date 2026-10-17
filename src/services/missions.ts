import { Mission, ProcessItem } from '../types';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 1,
    code: 'SEC-001',
    title: 'The Hidden Dotfile',
    description: 'An intercepted operational report was stashed in your home directory with restricted permissions. Discover it and inspect the payload.',
    objective: 'Reveal hidden dotfiles in /home/operator with permissions, restore read access with chmod, and cat the note to retrieve the flag.',
    flag: 'FLAG{CHMOD_MASTER_01}',
    hints: [
      "Standard 'ls' skips hidden dotfiles. Execute 'ls -la' to inspect all files along with their UNIX permission bits.",
      "Notice '.shadow_note' has permissions '000' ('----------'). Elevate its read permissions using 'chmod 644 .shadow_note' or 'chmod +r .shadow_note'.",
      "Run 'cat .shadow_note' to extract the key, then submit it via 'submit FLAG{...}' or the Mission Control panel."
    ],
    isUnlocked: true,
    isCompleted: false,
    solutionHint: 'ls -la -> chmod 644 .shadow_note -> cat .shadow_note -> submit FLAG{CHMOD_MASTER_01}'
  },
  {
    id: 2,
    code: 'SEC-002',
    title: 'Log Forensics',
    description: 'The edge firewall recorded repeated authentication probes on port 22. Identify the attacker\'s encoded payload in the system logs and decipher it.',
    objective: 'Investigate /var/log/auth.log, filter failed login anomalies using grep, and use the built-in decode utility on the Base64 string.',
    flag: 'FLAG{GREP_DETECTIVE_02}',
    hints: [
      "Navigate to the log directory using 'cd /var/log' or inspect '/var/log/auth.log' directly.",
      "Filter for failed events by running: grep \"FAILED\" auth.log (or grep FAILED auth.log).",
      "Notice the Base64 string payload 'RkxBR3tHUkVQX0RFVEVDVElWRV8wMn0='. Decode it using: decode RkxBR3tHUkVQX0RFVEVDVElWRV8wMn0="
    ],
    isUnlocked: false,
    isCompleted: false,
    solutionHint: 'cd /var/log -> grep "FAILED" auth.log -> decode RkxBR3tHUkVQX0RFVEVDVElWRV8wMn0= -> submit FLAG{GREP_DETECTIVE_02}'
  },
  {
    id: 3,
    code: 'SEC-003',
    title: 'Rogue Daemon',
    description: 'A malicious crypto-mining background process is consuming system cycles and locking access to the hardware storage vault at /opt/vault/reward.txt.',
    objective: 'Inspect running system processes using ps, terminate the unauthorized miner using kill <pid>, and read the unlocked vault reward file.',
    flag: 'FLAG{SYSADMIN_HERO_03}',
    hints: [
      "Inspect the live task table by running 'ps'. Look for high CPU usage and an unauthorized process command.",
      "Spot the rogue daemon 'xmrig_ghost' (PID 4892) running under user 'nobody'. Terminate it using 'kill 4892'.",
      "Once terminated, the vault lock will disengage. Read the victory flag using 'cat /opt/vault/reward.txt'."
    ],
    isUnlocked: false,
    isCompleted: false,
    solutionHint: 'ps -> kill 4892 -> cat /opt/vault/reward.txt -> submit FLAG{SYSADMIN_HERO_03}'
  }
];

export const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1, user: 'root', cpu: 0.1, mem: 0.4, command: '/sbin/init' },
  { pid: 142, user: 'root', cpu: 0.0, mem: 0.2, command: 'systemd-journald' },
  { pid: 418, user: 'systemd-resolve', cpu: 0.1, mem: 0.3, command: 'systemd-resolved' },
  { pid: 890, user: 'operator', cpu: 0.2, mem: 1.1, command: 'cyberdeck-shell --interactive' },
  { pid: 1042, user: 'operator', cpu: 0.4, mem: 0.9, command: 'telemetry-daemon --realtime' },
  { pid: 4892, user: 'nobody', cpu: 89.4, mem: 34.2, command: 'xmrig_ghost --pool stratum+tcp://darknet:3333', isRogue: true },
];
