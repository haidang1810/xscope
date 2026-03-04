interface PlaceholderProps {
  label: string;
}

/**
 * Temporary panel content placeholder — replaced in Phases 5-8.
 */
export function Placeholder({ label }: PlaceholderProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        opacity: 0.35,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
        Coming soon
      </span>
    </div>
  );
}
