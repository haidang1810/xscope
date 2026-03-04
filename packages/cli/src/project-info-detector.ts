import { existsSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import type { SessionInfo } from "@xscope/shared";

/** Detect tech stack from project files */
function detectTechStack(projectPath: string): string[] {
  const stack: string[] = [];

  // Check package.json dependencies
  const pkgPath = join(projectPath, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };
      const depNames = Object.keys(allDeps || {});

      if (depNames.some((d) => d === "react" || d === "react-dom")) stack.push("react");
      if (depNames.some((d) => d === "vue")) stack.push("vue");
      if (depNames.some((d) => d === "next")) stack.push("nextjs");
      if (depNames.some((d) => d === "svelte")) stack.push("svelte");
      if (depNames.some((d) => d === "express")) stack.push("express");
      if (depNames.some((d) => d === "hono")) stack.push("hono");
      if (depNames.some((d) => d === "tailwindcss" || d === "@tailwindcss/vite")) stack.push("tailwind");
      if (depNames.some((d) => d.includes("prisma"))) stack.push("prisma");
    } catch { /* ignore parse errors */ }
  }

  // Check for TypeScript
  if (existsSync(join(projectPath, "tsconfig.json"))) stack.push("typescript");

  // Check for other languages
  if (existsSync(join(projectPath, "Cargo.toml"))) stack.push("rust");
  if (existsSync(join(projectPath, "go.mod"))) stack.push("go");
  if (existsSync(join(projectPath, "pyproject.toml")) || existsSync(join(projectPath, "requirements.txt"))) stack.push("python");
  if (existsSync(join(projectPath, "Gemfile"))) stack.push("ruby");
  if (existsSync(join(projectPath, "pubspec.yaml"))) stack.push("flutter");
  if (existsSync(join(projectPath, "Dockerfile"))) stack.push("docker");

  // Runtime detection
  if (existsSync(join(projectPath, "bun.lock")) || existsSync(join(projectPath, "bunfig.toml"))) stack.push("bun");

  return stack;
}

/** Get project name from package.json or directory name */
function getProjectName(projectPath: string): string {
  const pkgPath = join(projectPath, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      if (pkg.name) return pkg.name;
    } catch { /* ignore */ }
  }
  return basename(projectPath);
}

/** Get current git branch */
async function getGitBranch(projectPath: string): Promise<string> {
  try {
    const proc = Bun.spawn(["git", "branch", "--show-current"], {
      cwd: projectPath,
      stdout: "pipe",
      stderr: "ignore",
    });
    const output = await new Response(proc.stdout).text();
    return output.trim() || "HEAD";
  } catch {
    return "unknown";
  }
}

/** Detect full project info — run once on startup */
export async function detectProjectInfo(projectPath: string): Promise<Omit<SessionInfo, "sessionId" | "model" | "startTime">> {
  const [gitBranch] = await Promise.all([getGitBranch(projectPath)]);

  return {
    projectPath,
    projectName: getProjectName(projectPath),
    gitBranch,
    techStack: detectTechStack(projectPath),
  };
}
