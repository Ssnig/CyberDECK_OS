import { createInitialVFS } from '../src/services/vfs';
import { INITIAL_MISSIONS, INITIAL_PROCESSES } from '../src/services/missions';
import { executeCommand } from '../src/services/commands';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

async function runSimulation() {
  console.log('--- Starting CyberDeck OS Headless CTF Simulation ---');

  const vfs = createInitialVFS();
  let procs = [...INITIAL_PROCESSES];
  let missions = INITIAL_MISSIONS.map(m => ({ ...m, isUnlocked: m.id === 1, isCompleted: false }));
  let cwd = '/home/operator';
  const history: string[] = [];

  // 1. Check help
  let res = executeCommand('help', cwd, vfs, procs, missions, history);
  assert(res.outputType === 'help', "Command 'help' outputs help glossary");

  // 2. Check pwd
  res = executeCommand('pwd', cwd, vfs, procs, missions, history);
  assert(res.outputContent === '/home/operator', "Command 'pwd' returns current directory");

  // --- MISSION 1: The Hidden Dotfile ---
  // Normal ls should NOT show .shadow_note
  res = executeCommand('ls', cwd, vfs, procs, missions, history);
  assert(!res.outputContent.includes('.shadow_note'), "'ls' hides dotfiles");

  // ls -la MUST show .shadow_note and permissions
  res = executeCommand('ls -la', cwd, vfs, procs, missions, history);
  assert(res.outputContent.includes('.shadow_note'), "'ls -la' reveals .shadow_note");
  assert(res.outputContent.includes('----------'), ".shadow_note has 000 permissions initially");

  // cat .shadow_note should fail with permission denied
  res = executeCommand('cat .shadow_note', cwd, vfs, procs, missions, history);
  assert(res.outputType === 'error' && res.outputContent.includes('Permission denied'), "cat on 000 file returns Permission Denied");

  // chmod 644 .shadow_note
  res = executeCommand('chmod 644 .shadow_note', cwd, vfs, procs, missions, history);
  assert(res.outputType === 'success', "chmod 644 on .shadow_note succeeds");

  // cat .shadow_note should now return flag
  res = executeCommand('cat .shadow_note', cwd, vfs, procs, missions, history);
  assert(res.outputContent.includes('FLAG{CHMOD_MASTER_01}'), "cat .shadow_note reveals FLAG{CHMOD_MASTER_01}");

  // submit FLAG{CHMOD_MASTER_01}
  res = executeCommand('submit FLAG{CHMOD_MASTER_01}', cwd, vfs, procs, missions, history);
  assert(res.outputType === 'success', "submit FLAG{CHMOD_MASTER_01} completes Mission 1");
  assert(missions[0].isCompleted === true, "Mission 1 marked completed");
  assert(missions[1].isUnlocked === true, "Mission 2 automatically unlocked");

  // --- MISSION 2: Log Forensics ---
  // cd /var/log
  res = executeCommand('cd /var/log', cwd, vfs, procs, missions, history);
  assert(res.newCwd === '/var/log', "cd /var/log moves to log folder");
  cwd = res.newCwd!;

  // grep "FAILED" auth.log
  res = executeCommand('grep "FAILED" auth.log', cwd, vfs, procs, missions, history);
  assert(res.outputContent.includes('RkxBR3tHUkVQX0RFVEVDVElWRV8wMn0='), "grep finds base64 payload");

  // decode payload
  res = executeCommand('decode RkxBR3tHUkVQX0RFVEVDVElWRV8wMn0=', cwd, vfs, procs, missions, history);
  assert(res.outputContent.includes('FLAG{GREP_DETECTIVE_02}'), "decode reveals FLAG{GREP_DETECTIVE_02}");

  // submit FLAG{GREP_DETECTIVE_02}
  res = executeCommand('submit FLAG{GREP_DETECTIVE_02}', cwd, vfs, procs, missions, history);
  assert(res.outputType === 'success', "submit FLAG{GREP_DETECTIVE_02} completes Mission 2");
  assert(missions[1].isCompleted === true, "Mission 2 marked completed");
  assert(missions[2].isUnlocked === true, "Mission 3 automatically unlocked");

  // --- MISSION 3: Rogue Daemon ---
  // ps lists processes including xmrig_ghost
  res = executeCommand('ps', cwd, vfs, procs, missions, history);
  assert(res.outputContent.includes('xmrig_ghost'), "ps lists xmrig_ghost miner daemon");
  assert(res.outputContent.includes('4892'), "PID 4892 is visible in process list");

  // Try reading /opt/vault/reward.txt before kill -> should be locked
  res = executeCommand('cat /opt/vault/reward.txt', cwd, vfs, procs, missions, history);
  assert(res.outputType === 'error' && res.outputContent.includes('ACCESS FORBIDDEN'), "reward.txt locked while rogue daemon running");

  // kill 4892
  res = executeCommand('kill 4892', cwd, vfs, procs, missions, history);
  assert(res.outputType === 'success' && res.audioTrigger === 'kill', "kill 4892 terminates daemon and plays kill sound");

  // Verify process removed from process table
  res = executeCommand('ps', cwd, vfs, procs, missions, history);
  assert(!res.outputContent.includes('xmrig_ghost'), "xmrig_ghost removed from process table");

  // Read /opt/vault/reward.txt now
  res = executeCommand('cat /opt/vault/reward.txt', cwd, vfs, procs, missions, history);
  assert(res.outputContent.includes('FLAG{SYSADMIN_HERO_03}'), "reward.txt now accessible with FLAG{SYSADMIN_HERO_03}");

  // submit FLAG{SYSADMIN_HERO_03}
  res = executeCommand('submit FLAG{SYSADMIN_HERO_03}', cwd, vfs, procs, missions, history);
  assert(res.outputType === 'success' && res.outputContent.includes('ALL MISSIONS CLEARED!'), "Mission 3 completed & Master Status awarded!");
  assert(missions[2].isCompleted === true, "Mission 3 marked completed");

  console.log('\n ALL 3 CTF MISSIONS AND COMMAND FLOWS PASSED VERIFICATION!');
}

runSimulation();
