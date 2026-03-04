/**
 * CSS glitch effect wrapper for ASCII banner text.
 * Uses ::before/::after pseudo-elements for color-split glitch.
 * Triggers randomly via long-duration CSS keyframe with sparse active window.
 */

import "./glitch-text.css";

interface Props {
  children: React.ReactNode;
  text: string; // used for data-text attribute on pseudo-elements
}

/** Wraps children with a CSS glitch animation overlay. */
export function GlitchText({ children, text }: Props) {
  return (
    <div className="glitch-wrapper" data-text={text}>
      {children}
    </div>
  );
}
