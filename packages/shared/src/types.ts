// WebSocket message types between CLI backend and dashboard frontend

export enum WsMessageType {
  /** Initial session snapshot with all accumulated data */
  SESSION_SNAPSHOT = "session_snapshot",
  /** Incremental token usage update from new assistant message */
  TOKEN_UPDATE = "token_update",
  /** New command executed by Claude Code */
  COMMAND_UPDATE = "command_update",
  /** File change detected in project */
  FILE_CHANGE = "file_change",
  /** Error detected in session */
  ERROR_UPDATE = "error_update",
  /** System metrics (CPU, RAM, disk, network) */
  SYSTEM_VITALS = "system_vitals",
  /** Session heartbeat / activity ping */
  HEARTBEAT = "heartbeat",
  /** Session ended or connection lost */
  SESSION_END = "session_end",
}

// --- Token & Cost ---

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface TurnTokens {
  turnIndex: number;
  timestamp: string;
  model: string;
  usage: TokenUsage;
  stopReason: string | null;
  cacheHitRate: number;
  responseTimeMs: number;
}

// --- Commands ---

export interface CommandEntry {
  id: string;
  command: string;
  exitCode: number | null;
  durationMs: number | null;
  timestamp: string;
  status: "running" | "success" | "failed";
  stdoutSnippet?: string;
  stderrSnippet?: string;
}

// --- File Changes ---

export interface FileChange {
  filePath: string;
  changeType: "created" | "modified" | "deleted";
  timestamp: string;
  touchCount: number;
  linesAdded: number;
  linesRemoved: number;
}

// --- Errors ---

export interface ErrorEntry {
  id: string;
  message: string;
  category: string;
  timestamp: string;
  filePath?: string;
  lineNumber?: number;
  isFixed: boolean;
}

// --- System Vitals ---

export interface SystemVitals {
  cpuUsagePercent: number;
  ramUsedMb: number;
  ramTotalMb: number;
  diskReadBytesPerSec: number;
  diskWriteBytesPerSec: number;
  networkBytesSent: number;
  timestamp: string;
}

// --- Session ---

export interface SessionInfo {
  sessionId: string;
  projectPath: string;
  projectName: string;
  gitBranch: string;
  techStack: string[];
  startTime: string;
  model: string;
}

export interface SessionMetrics {
  totalTokens: TokenUsage;
  turns: TurnTokens[];
  commands: CommandEntry[];
  fileChanges: FileChange[];
  errors: ErrorEntry[];
  systemVitals: SystemVitals;
  sessionInfo: SessionInfo;
  contextWindowPercent: number;
  burnRateTokensPerMin: number;
  estimatedTurnsRemaining: number;
  actionsPerMinute: number;
  lastActivityTimestamp: string;
}

// --- Vibe / Mood ---

export type VibeMood =
  | "shipping"
  | "on_fire"
  | "bug_hell"
  | "idle"
  | "focused"
  | "money_burn"
  | "victory";

// --- Scoreboard ---

export interface SessionScore {
  filesCreated: number;
  filesModified: number;
  filesDeleted: number;
  linesGenerated: number;
  commandsExecuted: number;
  commandSuccessRate: number;
  longestErrorFreeStreak: number;
  productivityScore: number;
  rank: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  rankProgress: number;
}

// --- Vibe State ---

export interface VibeState {
  mood: VibeMood;
  emoji: string;
  reason: string;
}

// --- Full Dashboard State ---

export interface DashboardState {
  sessionInfo: SessionInfo;
  totalTokens: TokenUsage;
  turns: TurnTokens[];
  commands: CommandEntry[];
  fileChanges: FileChange[];
  errors: ErrorEntry[];
  systemVitals: SystemVitals;
  vibe: VibeState;
  score: SessionScore;
  contextWindowPercent: number;
  burnRateTokensPerMin: number;
  estimatedTurnsRemaining: number;
  actionsPerMinute: number;
  lastActivityTimestamp: string;
}

// --- Raw JSONL Entry (from Claude Code logs) ---

export interface RawJsonlEntry {
  type: string;
  sessionId?: string;
  timestamp?: string;
  version?: string;
  gitBranch?: string;
  cwd?: string;
  uuid?: string;
  parentUuid?: string | null;
  message?: Record<string, unknown>;
  data?: Record<string, unknown>;
  snapshot?: Record<string, unknown>;
}

// --- Parsed Events ---

export type ParsedEvent =
  | { type: "turn"; data: TurnTokens }
  | { type: "command"; data: CommandEntry }
  | { type: "file-snapshot"; data: string[] }
  | { type: "error"; data: ErrorEntry }
  | { type: "session-info"; data: Partial<SessionInfo> };

// --- WebSocket Messages ---

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  payload: T;
  timestamp: string;
}
