import type {
  RawJsonlEntry,
  ParsedEvent,
  TurnTokens,
  CommandEntry,
  ErrorEntry,
  TokenUsage,
} from "@xscope/shared";
import { TOKEN_PRICING } from "@xscope/shared";

let turnCounter = 0;
let commandCounter = 0;
let errorCounter = 0;

/** Calculate cost for a single turn based on model pricing */
function calculateCost(model: string, usage: TokenUsage): number {
  const pricing = TOKEN_PRICING[model];
  if (!pricing) return 0;

  return (
    (usage.inputTokens * pricing.input +
      usage.outputTokens * pricing.output +
      usage.cacheCreationTokens * pricing.cacheCreation +
      usage.cacheReadTokens * pricing.cacheRead) /
    1_000_000
  );
}

/** Parse a single JSONL line into a typed event */
export function parseJsonlLine(line: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  let entry: RawJsonlEntry;
  try {
    entry = JSON.parse(line);
  } catch {
    return events;
  }

  const timestamp = entry.timestamp || new Date().toISOString();

  // --- Assistant message: extract tokens + tool calls ---
  if (entry.type === "assistant" && entry.message) {
    const msg = entry.message as Record<string, unknown>;
    const usage = msg.usage as Record<string, unknown> | undefined;
    const model = (msg.model as string) || "unknown";

    if (usage) {
      const inputTokens = (usage.input_tokens as number) || 0;
      const outputTokens = (usage.output_tokens as number) || 0;
      const cacheCreation =
        (usage.cache_creation_input_tokens as number) || 0;
      const cacheRead = (usage.cache_read_input_tokens as number) || 0;
      const totalTokens = inputTokens + outputTokens;

      const tokenUsage: TokenUsage = {
        inputTokens,
        outputTokens,
        cacheCreationTokens: cacheCreation,
        cacheReadTokens: cacheRead,
        totalTokens,
        estimatedCostUsd: 0,
      };
      tokenUsage.estimatedCostUsd = calculateCost(model, tokenUsage);

      const cacheHitRate =
        inputTokens > 0 ? cacheRead / inputTokens : 0;

      const contentArr = (msg.content as Array<Record<string, unknown>>) || [];
      const stopReason = (msg.stop_reason as string) || null;

      const turn: TurnTokens = {
        turnIndex: turnCounter++,
        timestamp,
        model,
        usage: tokenUsage,
        stopReason,
        cacheHitRate,
        responseTimeMs: 0,
      };
      events.push({ type: "turn", data: turn });

      // Extract tool_use calls (Bash commands, Read, Write, etc.)
      for (const block of contentArr) {
        if (block.type === "tool_use") {
          const toolName = (block.name as string) || "";
          const input = (block.input as Record<string, unknown>) || {};
          const toolUseId = (block.id as string) || `cmd-${commandCounter}`;

          let commandText = "";
          if (toolName === "Bash") {
            commandText = (input.command as string) || "";
          } else if (toolName === "Write" || toolName === "Read") {
            commandText = `${toolName}: ${(input.file_path as string) || ""}`;
          } else if (toolName === "Edit") {
            commandText = `Edit: ${(input.file_path as string) || ""}`;
          } else {
            commandText = `${toolName}: ${JSON.stringify(input).slice(0, 100)}`;
          }

          if (commandText) {
            const cmd: CommandEntry = {
              id: toolUseId,
              command: commandText,
              exitCode: null,
              durationMs: null,
              timestamp,
              status: "running",
            };
            events.push({ type: "command", data: cmd });
            commandCounter++;
          }
        }
      }
    }

    // Session info from first assistant message
    if (entry.gitBranch || entry.cwd) {
      events.push({
        type: "session-info",
        data: {
          sessionId: entry.sessionId,
          gitBranch: entry.gitBranch || "",
          projectPath: entry.cwd || "",
          model: (entry.message?.model as string) || "",
          startTime: timestamp,
        },
      });
    }
  }

  // --- User message: resolve tool results ---
  if (entry.type === "user" && entry.message) {
    const msg = entry.message as Record<string, unknown>;
    const content = msg.content;

    if (Array.isArray(content)) {
      for (const block of content as Array<Record<string, unknown>>) {
        if (block.type === "tool_result") {
          const toolUseId = (block.tool_use_id as string) || "";
          const isError = block.is_error === true;

          // Emit as command resolution
          const cmd: CommandEntry = {
            id: toolUseId,
            command: "",
            exitCode: isError ? 1 : 0,
            durationMs: null,
            timestamp,
            status: isError ? "failed" : "success",
          };
          events.push({ type: "command", data: cmd });

          // If error, also emit error event
          if (isError) {
            const errorContent =
              Array.isArray(block.content)
                ? (block.content as Array<Record<string, unknown>>)
                    .map((c) => (c.text as string) || "")
                    .join("\n")
                : String(block.content || "Unknown error");

            const error: ErrorEntry = {
              id: `err-${errorCounter++}`,
              message: errorContent.slice(0, 500),
              category: "tool_error",
              timestamp,
              isFixed: false,
            };
            events.push({ type: "error", data: error });
          }
        }
      }
    }
  }

  // --- File history snapshot ---
  if (entry.type === "file-history-snapshot" && entry.snapshot) {
    const snapshot = entry.snapshot as Record<string, unknown>;
    const backups = snapshot.trackedFileBackups as Record<string, unknown> | undefined;
    if (backups) {
      const filePaths = Object.keys(backups);
      if (filePaths.length > 0) {
        events.push({ type: "file-snapshot", data: filePaths });
      }
    }
  }

  return events;
}

/** Reset counters (useful for testing) */
export function resetParserCounters(): void {
  turnCounter = 0;
  commandCounter = 0;
  errorCounter = 0;
}
