import type { ReactNode } from "react";
import "../../styles/grid-layout.css";

interface DashboardGridProps {
  children: ReactNode;
}

/**
 * Root CSS Grid container that implements the 3-column dashboard layout.
 * Grid areas defined in grid-layout.css match the design spec ASCII art.
 */
export function DashboardGrid({ children }: DashboardGridProps) {
  return <div className="dashboard-grid">{children}</div>;
}
