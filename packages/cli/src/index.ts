#!/usr/bin/env bun
import { resolve } from "node:path";
import { DEFAULT_PORT } from "@xscope/shared";
import { findActiveSession } from "./session-finder";
import { LogWatcher } from "./log-watcher";
import { parseJsonlLine } from "./log-parser";
import { DataAggregator } from "./data-aggregator";
import { collectSystemVitals } from "./system-metrics-collector";
import { detectProjectInfo } from "./project-info-detector";
import { createServer } from "./websocket-server";
import { openBrowser } from "./browser-opener";

// --- Parse CLI args ---
const args = process.argv.slice(2);
const projectPath = args.find((a) => !a.startsWith("-")) || process.cwd();
const port = Number(args.find((a) => a.startsWith("--port="))?.split("=")[1]) || DEFAULT_PORT;
const noOpen = args.includes("--no-open");
// Resolve dashboard dist: works from both src/ (dev) and dist/ (built)
const cliDir = resolve(import.meta.dir, "..");
const dashboardDistPath = resolve(cliDir, "../dashboard/dist");

const log = (msg: string) => console.log(`\x1b[36m[XScope]\x1b[0m ${msg}`);
const logError = (msg: string) => console.error(`\x1b[31m[XScope]\x1b[0m ${msg}`);

log(`Starting... watching project: ${projectPath}`);

// --- Find active session ---
// Try project-specific first, then scan all projects as fallback
let session = findActiveSession(projectPath);
if (!session) {
  log("No session for this project, scanning all projects...");
  session = findActiveSession();
}
if (!session) {
  logError("No active Claude Code session found.");
  logError("Make sure Claude Code has run in this project.");
  process.exit(1);
}

log(`Session: ${session.sessionId}`);

// --- Initialize core components ---
const aggregator = new DataAggregator();
const watcher = new LogWatcher(session.jsonlPath);

// Detect project info
const projectInfo = await detectProjectInfo(projectPath);
aggregator.setSessionInfo({ sessionId: session.sessionId, ...projectInfo });

// --- Start WebSocket + Static File Server ---
const { scheduleBroadcast } = createServer({ port, aggregator, dashboardDistPath });

// --- Process log events ---
watcher.on("lines", (lines: string[]) => {
  for (const line of lines) {
    const events = parseJsonlLine(line);
    for (const event of events) {
      aggregator.processEvent(event);
    }
  }
  scheduleBroadcast();
});

watcher.on("error", (err: Error) => {
  logError(`Watcher error: ${err.message}`);
});

// --- System metrics polling (every 2s) ---
setInterval(() => {
  aggregator.updateVitals(collectSystemVitals());
  scheduleBroadcast();
}, 2000);

// --- Start watching ---
await watcher.start();

log(`Dashboard: http://localhost:${port}`);
log("Press Ctrl+C to stop");

// Auto-open browser
if (!noOpen) {
  openBrowser(`http://localhost:${port}`);
}

// --- Graceful shutdown ---
process.on("SIGINT", () => {
  log("Shutting down...");
  watcher.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  watcher.stop();
  process.exit(0);
});
