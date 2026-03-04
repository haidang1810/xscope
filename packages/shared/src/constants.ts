// Default server port
export const DEFAULT_PORT = 5757;

// Context window sizes per model (tokens)
export const CONTEXT_WINDOW_SIZE: Record<string, number> = {
  "claude-opus-4-6": 200_000,
  "claude-sonnet-4-6": 200_000,
  "claude-haiku-4-5-20251001": 200_000,
};

// Token pricing per million tokens (USD)
export const TOKEN_PRICING: Record<
  string,
  { input: number; output: number; cacheCreation: number; cacheRead: number }
> = {
  "claude-opus-4-6": {
    input: 15,
    output: 75,
    cacheCreation: 18.75,
    cacheRead: 1.5,
  },
  "claude-sonnet-4-6": {
    input: 3,
    output: 15,
    cacheCreation: 3.75,
    cacheRead: 0.3,
  },
  "claude-haiku-4-5-20251001": {
    input: 0.8,
    output: 4,
    cacheCreation: 1,
    cacheRead: 0.08,
  },
};

// Burn rate thresholds (tokens per minute)
export const BURN_RATE_THRESHOLDS = {
  low: 500,
  medium: 2000,
  high: 5000,
} as const;

// Vibe mood thresholds
export const VIBE_THRESHOLDS = {
  idleTimeoutMs: 120_000,
  errorStreakForBugHell: 3,
  costThresholdForMoneyBurn: 5,
} as const;

// Rank score thresholds
export const RANK_THRESHOLDS = {
  bronze: 0,
  silver: 100,
  gold: 300,
  platinum: 600,
  diamond: 1000,
} as const;

// Coffee cost for fun comparison
export const COFFEE_COST_USD = 1;
