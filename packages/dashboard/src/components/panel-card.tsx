import { motion } from "framer-motion";
import type { Easing } from "framer-motion";
import type { ReactNode } from "react";
import { useDashboardStore } from "../store/dashboard-store";
import type { PanelArea } from "../types/theme-types";

interface PanelCardProps {
  area: PanelArea;
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  /** Optional element rendered at the right side of the title bar */
  titleRight?: ReactNode;
}

const EASE_OUT: Easing = "easeOut";

const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: EASE_OUT },
};

/**
 * Glass-morphism panel card with grid-area placement.
 * Supports focus/dim state from Zustand store.
 * Uses Framer Motion fade-in + slide-up on mount.
 */
export function PanelCard({ area, title, icon, children, className = "", titleRight }: PanelCardProps) {
  const { focusedPanel, setFocusedPanel } = useDashboardStore();

  const isFocused = focusedPanel === area;
  const isDimmed = focusedPanel !== null && !isFocused;

  const stateClass = isFocused
    ? "is-focused"
    : isDimmed
      ? "is-dimmed"
      : "";

  function handleDoubleClick() {
    setFocusedPanel(isFocused ? null : area);
  }

  return (
    <motion.div
      className={`panel-card area-${area} ${stateClass} ${className}`}
      onDoubleClick={handleDoubleClick}
      title="Double-click to focus"
      {...fadeSlideUp}
    >
      <div className="panel-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon && <span className="panel-icon">{icon}</span>}
          <span className="panel-title">{title}</span>
        </span>
        {titleRight}
      </div>
      <div className="panel-content">{children}</div>
    </motion.div>
  );
}
