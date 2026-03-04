# XScope - Real-time Companion Dashboard for Claude Code

XScope is a live monitoring dashboard that runs alongside your Claude Code sessions. It visualizes token usage, costs, errors, file changes, and session activity in real-time through a beautiful cyberpunk-themed web interface.

![Dashboard Preview](https://img.shields.io/badge/status-beta-blue) ![Bun](https://img.shields.io/badge/runtime-Bun-black) ![License](https://img.shields.io/badge/license-MIT-green)

## What You Get

| Panel | What It Shows |
|-------|--------------|
| Token Burn Meter | How fast you're consuming tokens, with live cost counter |
| Token Flow | Input/output tokens per conversation turn |
| Context Gauge | How much of the context window is used |
| File Heatmap | Most modified files in the session |
| Command Arsenal | Tools and commands Claude has executed |
| Error Graveyard | Errors encountered and whether they're resolved |
| Session Heartbeat | Real-time ECG-style activity pulse |
| Scoreboard | Productivity rank, stats, and error-free streaks |

---

## Requirements

You only need **one thing** installed:

- **Bun** (JavaScript runtime) - version 1.0 or higher

### Install Bun

Open your terminal and paste this command:

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

After installing, **close and reopen your terminal**, then verify:
```bash
bun --version
```
You should see a version number like `1.x.x`. If you see "command not found", try opening a new terminal window.

---

## Installation

### Step 1: Download XScope

```bash
git clone https://github.com/user/xscope.git
cd xscope
```

Or download and extract the ZIP file from the releases page.

### Step 2: Install Dependencies

```bash
bun install
```

This downloads all required packages. Wait until it finishes (usually 5-15 seconds).

### Step 3: Build

```bash
bun run build
```

This compiles the dashboard and CLI. You'll see output ending with "built in Xs" - that means success.

### Step 4: Register the `xscope` Command

```bash
cd packages/cli && bun link && cd ../..
```

Done! You can now use `xscope` from any directory.

### Verify Installation

```bash
xscope --help
```

---

## Usage

### Basic Usage

1. **Start a Claude Code session** in your project (as you normally do)
2. **Open a new terminal** (keep Claude Code running in the other one)
3. Run:

```bash
xscope
```

That's it! XScope will:
- Automatically find your active Claude Code session
- Start a local web server
- Open the dashboard in your browser at `http://localhost:5757`

### Options

```bash
# Watch a specific project folder
xscope /path/to/your/project

# Use a different port (if 5757 is taken)
xscope --port=8080

# Don't auto-open the browser
xscope --no-open
```

### Stop XScope

Press `Ctrl + C` in the terminal where XScope is running.

---

## Keyboard Shortcuts (in the Dashboard)

| Key | Action |
|-----|--------|
| `T` | Cycle through themes (Cyberpunk, Matrix, Synthwave, Nord, Dracula, Terminal Green) |
| `F` | Toggle fullscreen |
| `R` | Reset session |

---

## Themes

XScope comes with 6 built-in themes. Press `T` in the dashboard to cycle through them:

- **Cyberpunk** (default) - Neon pink & cyan on dark
- **Matrix** - Green terminal aesthetic
- **Synthwave** - Purple & orange retro vibes
- **Nord** - Cool blue Scandinavian palette
- **Dracula** - Classic dark theme
- **Terminal Green** - Hacker-style monochrome green

---

## Troubleshooting

### "No active Claude Code session found"

This means XScope couldn't detect a running Claude Code session.

**Fix:** Make sure Claude Code has been used in your project at least once. XScope looks for session data in `~/.claude/projects/`.

### "Is port 5757 in use?"

Another program (or another XScope instance) is using port 5757.

**Fix:** Either stop the other program, or use a different port:
```bash
xscope --port=8080
```

### Dashboard shows "Disconnected"

The WebSocket connection to XScope was lost.

**Fix:** Check that the `xscope` command is still running in your terminal. If it crashed, restart it.

### Dashboard shows all zeros

Claude Code hasn't generated any activity yet in the current session.

**Fix:** Use Claude Code to make some changes, and the dashboard will update in real-time.

### "command not found: xscope"

The CLI isn't linked globally.

**Fix:**
```bash
cd /path/to/xscope/packages/cli
bun link
```

Then open a **new terminal** and try again.

---

## Updating

```bash
cd /path/to/xscope
git pull
bun install
bun run build
```

---

## Tech Stack

- **Runtime:** Bun
- **Frontend:** React 19, Vite 6, Framer Motion, Recharts, Tailwind CSS 4
- **Backend:** Bun WebSocket server
- **Monorepo:** Bun workspaces (packages/shared, packages/cli, packages/dashboard)

---

## License

MIT
