import type {
  DashboardState,
  ParsedEvent,
  TokenUsage,
  TurnTokens,
  CommandEntry,
  FileChange,
  ErrorEntry,
  SystemVitals,
  SessionInfo,
  VibeState,
  SessionScore,
} from "@xscope/shared";
import {
  BURN_RATE_THRESHOLDS,
  CONTEXT_WINDOW_SIZE,
  VIBE_THRESHOLDS,
  RANK_THRESHOLDS,
  COFFEE_COST_USD,
} from "@xscope/shared";

/** Empty token usage */
function emptyTokenUsage(): TokenUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
  };
}

/** Aggregate parsed events into full dashboard state */
export class DataAggregator {
  private turns: TurnTokens[] = [];
  private commands: Map<string, CommandEntry> = new Map();
  private fileChanges: Map<string, FileChange> = new Map();
  private errors: ErrorEntry[] = [];
  private vitals: SystemVitals = {
    cpuUsagePercent: 0,
    ramUsedMb: 0,
    ramTotalMb: 0,
    diskReadBytesPerSec: 0,
    diskWriteBytesPerSec: 0,
    networkBytesSent: 0,
    timestamp: new Date().toISOString(),
  };
  private sessionInfo: SessionInfo = {
    sessionId: "",
    projectPath: "",
    projectName: "",
    gitBranch: "",
    techStack: [],
    startTime: new Date().toISOString(),
    model: "",
  };
  private lastActivityTimestamp = new Date().toISOString();
  private errorFreeStreak = 0;
  private longestStreak = 0;
  private dirty = false;

  /** Process a parsed event and update internal state */
  processEvent(event: ParsedEvent): void {
    this.dirty = true;
    this.lastActivityTimestamp = new Date().toISOString();

    switch (event.type) {
      case "turn":
        this.turns.push(event.data);
        if (!this.sessionInfo.model && event.data.model) {
          this.sessionInfo.model = event.data.model;
        }
        break;

      case "command": {
        const existing = this.commands.get(event.data.id);
        if (existing) {
          // Resolve pending command with result
          existing.exitCode = event.data.exitCode;
          existing.status = event.data.status;
          existing.durationMs = event.data.durationMs;
          if (event.data.status === "failed") {
            this.errorFreeStreak = 0;
          } else if (event.data.status === "success") {
            this.errorFreeStreak++;
            this.longestStreak = Math.max(this.longestStreak, this.errorFreeStreak);
          }
        } else if (event.data.command) {
          // New command
          this.commands.set(event.data.id, event.data);
        }
        break;
      }

      case "file-snapshot":
        for (const filePath of event.data) {
          const existing = this.fileChanges.get(filePath);
          if (existing) {
            existing.touchCount++;
            existing.timestamp = new Date().toISOString();
          } else {
            this.fileChanges.set(filePath, {
              filePath,
              changeType: "modified",
              timestamp: new Date().toISOString(),
              touchCount: 1,
              linesAdded: 0,
              linesRemoved: 0,
            });
          }
        }
        break;

      case "error":
        this.errors.push(event.data);
        this.errorFreeStreak = 0;
        break;

      case "session-info":
        Object.assign(this.sessionInfo, event.data);
        break;
    }
  }

  /** Update system vitals from collector */
  updateVitals(vitals: SystemVitals): void {
    this.vitals = vitals;
    this.dirty = true;
  }

  /** Set initial session info from project detector */
  setSessionInfo(info: Partial<SessionInfo>): void {
    Object.assign(this.sessionInfo, info);
  }

  /** Check if state changed since last getState call */
  isDirty(): boolean {
    return this.dirty;
  }

  /** Get full dashboard state snapshot */
  getState(): DashboardState {
    this.dirty = false;
    const totalTokens = this.computeTotalTokens();
    const model = this.sessionInfo.model || "claude-sonnet-4-6";
    const contextSize = CONTEXT_WINDOW_SIZE[model] || 200_000;

    // Context % based on last turn's total input (input + cache_read + cache_creation = full conversation)
    const lastTurn = this.turns[this.turns.length - 1];
    const lastContextTokens = lastTurn
      ? lastTurn.usage.inputTokens + lastTurn.usage.cacheReadTokens + lastTurn.usage.cacheCreationTokens
      : 0;
    const contextWindowPercent = Math.min(100, (lastContextTokens / contextSize) * 100);

    const burnRate = this.computeBurnRate();
    // Estimate how many turns remain before context fills up
    // Use average output tokens per turn as growth rate (output gets added to context)
    const avgOutputPerTurn = this.turns.length > 0 ? totalTokens.outputTokens / this.turns.length : 0;
    const remainingTokens = contextSize - lastContextTokens;
    const estimatedTurnsRemaining = avgOutputPerTurn > 0 ? Math.floor(remainingTokens / avgOutputPerTurn) : 99;

    const commands = Array.from(this.commands.values());
    const successCommands = commands.filter((c) => c.status === "success").length;

    return {
      sessionInfo: this.sessionInfo,
      totalTokens,
      turns: this.turns,
      commands,
      fileChanges: Array.from(this.fileChanges.values()),
      errors: this.errors,
      systemVitals: this.vitals,
      vibe: this.computeVibe(burnRate, contextWindowPercent),
      score: this.computeScore(commands, successCommands),
      contextWindowPercent,
      burnRateTokensPerMin: burnRate,
      estimatedTurnsRemaining,
      actionsPerMinute: this.computeActionsPerMinute(),
      lastActivityTimestamp: this.lastActivityTimestamp,
    };
  }

  private computeTotalTokens(): TokenUsage {
    const total = emptyTokenUsage();
    for (const turn of this.turns) {
      total.inputTokens += turn.usage.inputTokens;
      total.outputTokens += turn.usage.outputTokens;
      total.cacheCreationTokens += turn.usage.cacheCreationTokens;
      total.cacheReadTokens += turn.usage.cacheReadTokens;
      total.totalTokens += turn.usage.totalTokens;
      total.estimatedCostUsd += turn.usage.estimatedCostUsd;
    }
    return total;
  }

  /** Rolling 5-minute burn rate (tokens/min) */
  private computeBurnRate(): number {
    if (this.turns.length < 2) return 0;

    const now = Date.now();
    const fiveMinAgo = now - 5 * 60 * 1000;
    const recentTurns = this.turns.filter(
      (t) => new Date(t.timestamp).getTime() > fiveMinAgo,
    );

    if (recentTurns.length === 0) return 0;

    const tokensInWindow = recentTurns.reduce((sum, t) => sum + t.usage.totalTokens, 0);
    const firstTime = new Date(recentTurns[0].timestamp).getTime();
    const elapsedMin = Math.max(1, (now - firstTime) / 60_000);

    return Math.round(tokensInWindow / elapsedMin);
  }

  private computeActionsPerMinute(): number {
    if (this.turns.length < 2) return 0;
    const first = new Date(this.turns[0].timestamp).getTime();
    const last = new Date(this.turns[this.turns.length - 1].timestamp).getTime();
    const elapsedMin = Math.max(1, (last - first) / 60_000);
    return Math.round(this.turns.length / elapsedMin);
  }

  private computeVibe(burnRate: number, contextPercent: number): VibeState {
    const recentErrors = this.errors.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < 60_000,
    ).length;

    const timeSinceActivity = Date.now() - new Date(this.lastActivityTimestamp).getTime();

    if (timeSinceActivity > VIBE_THRESHOLDS.idleTimeoutMs) {
      return { mood: "idle", emoji: "\u{1F634}", reason: "No activity for 2+ minutes" };
    }
    if (recentErrors >= VIBE_THRESHOLDS.errorStreakForBugHell) {
      return { mood: "bug_hell", emoji: "\u{1F480}", reason: `${recentErrors} errors in last minute` };
    }
    if (this.computeTotalTokens().estimatedCostUsd > VIBE_THRESHOLDS.costThresholdForMoneyBurn) {
      return { mood: "money_burn", emoji: "\u{1F4B8}", reason: "Cost exceeded $5 threshold" };
    }
    if (burnRate > BURN_RATE_THRESHOLDS.high) {
      return { mood: "on_fire", emoji: "\u{1F525}", reason: "High token burn rate" };
    }
    if (this.fileChanges.size > 5 && recentErrors === 0) {
      return { mood: "shipping", emoji: "\u{1F680}", reason: "Many files changed, no errors" };
    }
    return { mood: "focused", emoji: "\u{1F3AF}", reason: "Steady progress" };
  }

  private computeScore(commands: CommandEntry[], successCount: number): SessionScore {
    const filesCreated = Array.from(this.fileChanges.values()).filter((f) => f.changeType === "created").length;
    const filesModified = Array.from(this.fileChanges.values()).filter((f) => f.changeType === "modified").length;
    const filesDeleted = Array.from(this.fileChanges.values()).filter((f) => f.changeType === "deleted").length;
    const commandSuccessRate = commands.length > 0 ? successCount / commands.length : 1;

    const productivityScore =
      filesCreated * 10 +
      filesModified * 5 +
      successCount * 3 +
      this.longestStreak * 2 +
      this.turns.length;

    let rank: SessionScore["rank"] = "bronze";
    if (productivityScore >= RANK_THRESHOLDS.diamond) rank = "diamond";
    else if (productivityScore >= RANK_THRESHOLDS.platinum) rank = "platinum";
    else if (productivityScore >= RANK_THRESHOLDS.gold) rank = "gold";
    else if (productivityScore >= RANK_THRESHOLDS.silver) rank = "silver";

    // Progress to next rank
    const thresholds = Object.values(RANK_THRESHOLDS);
    const currentThreshold = RANK_THRESHOLDS[rank];
    const nextIdx = thresholds.indexOf(currentThreshold) + 1;
    const nextThreshold = thresholds[nextIdx] || currentThreshold + 500;
    const rankProgress = Math.min(1, (productivityScore - currentThreshold) / (nextThreshold - currentThreshold));

    return {
      filesCreated,
      filesModified,
      filesDeleted,
      linesGenerated: 0,
      commandsExecuted: commands.length,
      commandSuccessRate,
      longestErrorFreeStreak: this.longestStreak,
      productivityScore,
      rank,
      rankProgress,
    };
  }
}
