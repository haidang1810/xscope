import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface FoundSession {
  sessionId: string;
  jsonlPath: string;
  projectDir: string;
  encodedPath: string;
}

/** Encode absolute path to Claude Code directory name format */
function encodeProjectPath(absolutePath: string): string {
  return absolutePath.replace(/\//g, "-");
}

/**
 * Find the most recently active Claude Code session.
 * Looks in ~/.claude/projects/{encoded-path}/ for .jsonl files.
 */
export function findActiveSession(projectPath?: string): FoundSession | null {
  const claudeProjectsDir = join(homedir(), ".claude", "projects");

  try {
    readdirSync(claudeProjectsDir);
  } catch {
    console.error("Claude Code projects directory not found:", claudeProjectsDir);
    return null;
  }

  // If project path given, target that specific directory
  const targetDirs: string[] = [];
  if (projectPath) {
    const encoded = encodeProjectPath(projectPath);
    targetDirs.push(encoded);
  } else {
    // Scan all project directories, find most recent session globally
    try {
      const dirs = readdirSync(claudeProjectsDir);
      targetDirs.push(...dirs);
    } catch {
      return null;
    }
  }

  let bestSession: FoundSession | null = null;
  let bestMtime = 0;

  for (const dir of targetDirs) {
    const dirPath = join(claudeProjectsDir, dir);
    try {
      const stat = statSync(dirPath);
      if (!stat.isDirectory()) continue;
    } catch {
      continue;
    }

    try {
      const files = readdirSync(dirPath);
      for (const file of files) {
        if (!file.endsWith(".jsonl")) continue;

        const filePath = join(dirPath, file);
        const mtime = statSync(filePath).mtimeMs;

        if (mtime > bestMtime) {
          bestMtime = mtime;
          bestSession = {
            sessionId: file.replace(".jsonl", ""),
            jsonlPath: filePath,
            projectDir: dir,
            encodedPath: dir,
          };
        }
      }
    } catch {
      continue;
    }
  }

  return bestSession;
}

/** List all available sessions for a project, sorted by most recent first */
export function listSessions(projectPath: string): FoundSession[] {
  const claudeProjectsDir = join(homedir(), ".claude", "projects");
  const encoded = encodeProjectPath(projectPath);
  const dirPath = join(claudeProjectsDir, encoded);

  try {
    const files = readdirSync(dirPath)
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => ({
        file: f,
        mtime: statSync(join(dirPath, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    return files.map((f) => ({
      sessionId: f.file.replace(".jsonl", ""),
      jsonlPath: join(dirPath, f.file),
      projectDir: dirPath,
      encodedPath: encoded,
    }));
  } catch {
    return [];
  }
}
