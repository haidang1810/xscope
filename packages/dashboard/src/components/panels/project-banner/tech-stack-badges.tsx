/**
 * Displays detected tech stack as emoji/label badges.
 * Maps tech stack string identifiers to emoji icons.
 */

// Map tech stack names (case-insensitive) to emoji icons
const TECH_ICONS: Record<string, string> = {
  react: "⚛️",
  typescript: "🔷",
  ts: "🔷",
  javascript: "🟨",
  js: "🟨",
  bun: "🥟",
  node: "🟢",
  nodejs: "🟢",
  python: "🐍",
  rust: "🦀",
  go: "🐹",
  golang: "🐹",
  docker: "🐳",
  git: "📦",
  postgres: "🐘",
  postgresql: "🐘",
  redis: "🔴",
  graphql: "◈",
  next: "▲",
  nextjs: "▲",
  vue: "💚",
  svelte: "🔥",
  tailwind: "🌊",
  vite: "⚡",
  prisma: "△",
  drizzle: "💧",
};

interface Props {
  techStack: string[];
}

/** Row of tech stack emoji badges. */
export function TechStackBadges({ techStack }: Props) {
  if (!techStack || techStack.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginTop: "6px",
      }}
    >
      {techStack.slice(0, 10).map((tech) => {
        const key = tech.toLowerCase().replace(/[^a-z0-9]/g, "");
        const icon = TECH_ICONS[key] ?? "◈";
        return (
          <span
            key={tech}
            title={tech}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-panel)",
              background: "rgba(255,255,255,0.04)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              letterSpacing: "0.04em",
            }}
          >
            <span style={{ fontSize: "12px" }}>{icon}</span>
            {tech}
          </span>
        );
      })}
    </div>
  );
}
