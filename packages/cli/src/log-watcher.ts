import { watch, statSync } from "node:fs";
import { EventEmitter } from "node:events";

/**
 * Watches a JSONL file for new lines using fs.watch + incremental reads.
 * Emits "lines" event with array of new raw JSONL strings.
 */
export class LogWatcher extends EventEmitter {
  private offset = 0;
  private watcher: ReturnType<typeof watch> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly debounceMs = 50;

  constructor(private filePath: string) {
    super();
  }

  /** Parse existing content and start watching for changes */
  async start(): Promise<void> {
    // Read entire existing file first
    await this.readNewLines();

    // Watch for changes
    this.watcher = watch(this.filePath, () => {
      // Debounce rapid writes
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.readNewLines(), this.debounceMs);
    });
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private async readNewLines(): Promise<void> {
    try {
      // Check if file was truncated/rotated
      const stat = statSync(this.filePath);
      if (stat.size < this.offset) {
        this.offset = 0;
      }
      if (stat.size === this.offset) return;

      // Read only new bytes using Bun.file().slice()
      const file = Bun.file(this.filePath);
      const slice = file.slice(this.offset);
      const text = await slice.text();
      this.offset = stat.size;

      // Split into lines, filter empty
      const lines = text.split("\n").filter((line) => line.trim().length > 0);

      if (lines.length > 0) {
        this.emit("lines", lines);
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
}
