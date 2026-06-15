#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

const PORT = Number.parseInt(process.env.OPENCHAMBER_PORT || '4488', 10);

if (!Number.isFinite(PORT) || PORT <= 0 || PORT > 65535) {
  console.error(`[stop:web] Invalid OPENCHAMBER_PORT: ${process.env.OPENCHAMBER_PORT}`);
  process.exit(1);
}

const PLATFORM = process.platform;
const IS_WINDOWS = PLATFORM === 'win32';
const SIGTERM_TIMEOUT_MS = 3000;

const log = (msg) => console.log(`[stop:web] ${msg}`);
const warn = (msg) => console.warn(`[stop:web] ${msg}`);

function parsePids(raw) {
  return raw
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
}

function findPidsUnix() {
  const result = spawnSync('lsof', ['-ti', `tcp:${PORT}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  if (result.error) {
    if (result.error.code === 'ENOENT') {
      warn('lsof not found. Please install it (macOS: preinstalled; Linux: `apt install lsof` or use `ss`/`fuser`).');
    } else {
      warn(`lsof failed: ${result.error.message}`);
    }
    return [];
  }
  if (result.status !== 0) return [];
  return parsePids(result.stdout);
}

function findPidsWindows() {
  const result = spawnSync('netstat', ['-ano', '-p', 'TCP'], { encoding: 'utf8' });
  if (result.error) {
    warn(`netstat failed: ${result.error.message}`);
    return [];
  }
  if (result.status !== 0) return [];
  const lines = result.stdout.split(/\r?\n/);
  const pids = new Set();
  const portSuffix = `:${PORT}`;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.includes(portSuffix)) continue;
    if (!/LISTENING/i.test(trimmed)) continue;
    const parts = trimmed.split(/\s+/);
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid)) pids.add(pid);
  }
  return Array.from(pids);
}

function sendSignalUnix(pids, signal) {
  const arg = signal === 'SIGKILL' ? '-9' : '-15';
  const result = spawnSync('kill', [arg, ...pids], { stdio: 'inherit' });
  if (result.error) {
    warn(`kill failed: ${result.error.message}`);
    return false;
  }
  return result.status === 0;
}

function killWindows(pids) {
  let ok = true;
  for (const pid of pids) {
    const result = spawnSync('taskkill', ['/F', '/PID', pid], { stdio: 'inherit' });
    if (result.error || result.status !== 0) ok = false;
  }
  return ok;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPidsGone(pids) {
  const deadline = Date.now() + SIGTERM_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const stillRunning = IS_WINDOWS ? findPidsWindows() : findPidsUnix();
    const stillAlive = stillRunning.filter((p) => pids.includes(p));
    if (stillAlive.length === 0) return true;
    await sleep(200);
  }
  return false;
}

async function main() {
  log(`Looking for web server on port ${PORT} (${PLATFORM})…`);

  const pids = IS_WINDOWS ? findPidsWindows() : findPidsUnix();

  if (pids.length === 0) {
    log(`No process listening on port ${PORT}. Nothing to stop.`);
    process.exit(0);
  }

  log(`Found PID(s): ${pids.join(', ')}`);

  if (IS_WINDOWS) {
    log('Stopping (taskkill /F)…');
    const ok = killWindows(pids);
    if (!ok) {
      warn('Some processes could not be terminated.');
      process.exit(1);
    }
    log('Stopped.');
    process.exit(0);
  }

  log('Sending SIGTERM…');
  sendSignalUnix(pids, 'SIGTERM');

  log(`Waiting up to ${SIGTERM_TIMEOUT_MS / 1000}s for graceful shutdown…`);
  const gone = await waitForPidsGone(pids);

  if (gone) {
    log('Stopped gracefully.');
    process.exit(0);
  }

  warn('Graceful shutdown timed out. Sending SIGKILL…');
  sendSignalUnix(pids, 'SIGKILL');
  const forceGone = await waitForPidsGone(pids);
  if (forceGone) {
    log('Stopped (forced).');
    process.exit(0);
  }

  warn('Processes still alive after SIGKILL.');
  process.exit(1);
}

main().catch((err) => {
  console.error(`[stop:web] Unexpected error: ${err?.stack || err}`);
  process.exit(1);
});
