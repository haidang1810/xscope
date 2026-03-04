# 🔬 XScope

## Companion Dashboard — Thấy những gì Claude Code không show

---

## 📌 Tổng quan dự án

**XScope** là một companion dashboard chạy local, hoạt động song song với Claude Code. Người dùng chia terminal thành 2 nửa: bên trái chạy Claude Code như bình thường, bên phải chạy CLI tool này — tool sẽ tự động collect data từ Claude Code session và mở một web dashboard trên browser với giao diện đẹp, animation mượt, hiển thị những thông tin mà Claude Code không show hoặc rất khó xem.

**Tại sao cần tool này?**

Claude Code là CLI thuần text. Bạn không biết mình đang tốn bao nhiêu token, bao nhiêu tiền, context window còn bao nhiêu, file nào bị sửa nhiều nhất, command nào fail... Tất cả những thông tin đó đều "ẩn" và phải tự đoán. XScope biến tất cả thành visual dashboard real-time, vừa hữu ích vừa đẹp để screenshot đi khoe.

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────┐
│                    TERMINAL                      │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │                  │  │                      │  │
│  │   Claude Code    │  │   XScope CLI         │  │
│  │   (chạy bth)     │  │   (collect data)     │  │
│  │                  │  │                      │  │
│  └──────────────────┘  └──────────┬───────────┘  │
│                                   │              │
└───────────────────────────────────┼──────────────┘
                                    │
                          WebSocket │ real-time
                                    │
                    ┌───────────────▼───────────────┐
                    │                               │
                    │     🌐 Browser Dashboard      │
                    │     http://localhost:5757      │
                    │                               │
                    │   Full animation, charts,     │
                    │   interactive panels          │
                    │                               │
                    └───────────────────────────────┘
```

**Luồng hoạt động:**

1. User chạy `xscope` trong terminal → CLI bắt đầu watch Claude Code log/process
2. CLI tự động mở browser tại `http://localhost:5757`
3. CLI collect data (token usage, file changes, system stats...) gửi qua WebSocket
4. Browser dashboard render real-time với animation đẹp

**Tech stack:**

- **CLI Backend:** Node.js (hoặc Bun) — file watcher, process monitor, WebSocket server
- **Frontend Dashboard:** React + Framer Motion + Recharts + Canvas/WebGL cho particle effects
- **Communication:** WebSocket cho real-time data streaming
- **Data source:** Claude Code log files, file system watcher, system metrics

---

## ✨ Danh sách tính năng chi tiết

---

### 1. 🔥 Token Burn Meter — Hero Panel

**Mô tả:** Gauge hình tròn lớn ở vị trí trung tâm dashboard, hiển thị token consumption real-time. Đây là panel chính, chiếm diện tích lớn nhất và bắt mắt nhất.

**Thông tin hiển thị:**

- Tổng tokens đã dùng (input + output riêng)
- Estimated cost hiện tại bằng USD
- Burn rate hiện tại (tokens/phút)
- So sánh vui: "Session này tốn bằng X ly cà phê ☕"

**Animation & Visual:**

- **Gauge dạng speedometer** với kim quay mượt bằng spring animation (Framer Motion)
- Vùng gauge chia 3 zone: Xanh lá (tiết kiệm) → Vàng (bình thường) → Đỏ (burn nhanh)
- **Particle lửa 🔥** bùng lên quanh gauge khi burn rate vượt ngưỡng cao — dùng Canvas 2D particle system, mỗi particle là đốm lửa bay lên và mờ dần
- **Hiệu ứng đếm tiền:** Số $ chạy lên kiểu slot machine khi cost tăng, với slight overshoot bounce
- **Glow effect:** Viền gauge phát sáng đỏ pulse khi ở vùng nguy hiểm
- **Idle state:** Khi không có activity, kim gauge từ từ rung nhẹ (jitter animation) để show dashboard vẫn alive

---

### 2. 📊 Token Flow Waterfall Chart

**Mô tả:** Chart dạng bar/waterfall hiển thị token usage theo từng turn trong conversation. Giúp identify turn nào tốn nhiều token nhất.

**Thông tin hiển thị:**

- Mỗi cột = 1 turn/message
- Chiều cao cột = total tokens turn đó
- Phân tách input tokens (phần dưới) vs output tokens (phần trên)
- Hover tooltip: chi tiết tokens, cache hit %, thời gian response

**Animation & Visual:**

- **Cột mọc lên từ dưới** với stagger animation — cột sau mọc chậm hơn cột trước 50ms, tạo hiệu ứng sóng
- **Gradient màu** mỗi cột: xanh dương (ít tokens) → tím → đỏ cam (nhiều tokens) dùng linear gradient SVG
- **Ripple effect** khi cột mới xuất hiện — vòng sóng lan ra từ đỉnh cột
- **Sparkline overlay** — đường trend line mỏng chạy qua đỉnh các cột, animate draw từ trái sang phải
- **Glow neon** trên cột cao nhất (most expensive turn)
- **Smooth transition** khi có data mới — cột cũ slide sang trái, cột mới grow lên từ phải

---

### 3. 💓 Session Heartbeat Monitor

**Mô tả:** Đường heartbeat kiểu máy monitor bệnh viện, mỗi nhịp đập = 1 API call hoặc 1 action từ Claude Code.

**Thông tin hiển thị:**

- Frequency: bao nhiêu actions/phút
- Trạng thái: Active (nhịp nhanh), Thinking (nhịp chậm), Idle (flatline)
- Thời gian session uptime

**Animation & Visual:**

- **ECG line animation** — đường kẻ xanh lá chạy liên tục từ trái sang phải trên nền đen, vẽ bằng Canvas path animation
- **Peak spike** mỗi khi có API call — đường nhảy lên rồi xuống tạo hình tim đập
- **Flatline** khi idle quá 30 giây — đường thẳng ngang + beep dài (optional sound)
- **Trail effect** — đường cũ fade dần thành màu tối, chỉ phần mới nhất sáng rõ
- **Scan line** — vạch dọc sáng chạy từ trái sang phải kiểu radar sweep
- **Color shift:** Xanh lá (bình thường) → Vàng (intense) → Đỏ (error detected)

---

### 4. 🎨 Project Banner — ASCII Art Header

**Mô tả:** Banner lớn ở đầu dashboard hiển thị tên project hiện tại dưới dạng ASCII art/typography đẹp.

**Thông tin hiển thị:**

- Tên project (lấy từ package.json hoặc folder name)
- Tech stack auto-detect (icons cho React, Node, Python...)
- Session start time
- Git branch hiện tại

**Animation & Visual:**

- **Text reveal animation** — mỗi ký tự ASCII art xuất hiện lần lượt từ trái sang phải, kiểu đang được "gõ" ra bởi máy
- **Rainbow gradient cycling** trên text — màu chạy liên tục qua các ký tự dùng CSS hue-rotate animation
- **Glitch effect ngẫu nhiên** — cứ vài giây text bị "glitch" nhẹ (shift ngang, đổi màu, nhiễu) rồi trở lại bình thường, dùng CSS transform + clip-path
- **Background matrix rain** nhẹ phía sau text — các ký tự random rơi xuống mờ mờ
- **Tech stack icons** hiện lên với bounce animation bên dưới project name

---

### 5. 🗺️ File Heatmap — Interactive File Tree

**Mô tả:** Bản đồ nhiệt của project — hiển thị tất cả files, tô màu theo mức độ bị modify trong session.

**Thông tin hiển thị:**

- Cấu trúc file/folder dạng treemap hoặc tree view
- Số dòng added (+) và removed (-) per file
- Thời điểm file được sửa lần cuối
- Tổng số lần file bị touch trong session

**Animation & Visual:**

- **Treemap layout** — mỗi file là 1 ô chữ nhật, size tỉ lệ với số lần modify
- **Heatmap coloring:** Đỏ rực = sửa nhiều nhất, cam = vừa, xanh mát = chưa đụng, với smooth gradient transition
- **Pulse glow** trên file vừa được sửa gần nhất — viền file sáng lên rồi mờ dần theo heartbeat rhythm
- **Hover effect:** Ô phóng to nhẹ (scale 1.05) + tooltip hiện chi tiết + lines changed
- **Click action:** Click vào file → mở file trong VSCode thông qua `code <filepath>` command
- **New file animation:** Khi file mới được tạo, ô "nở" ra từ center với spring animation
- **Delete animation:** File bị xóa thì ô "tan rã" thành particles bay đi

---

### 6. 🧰 Command Arsenal — Bash History Panel

**Mô tả:** Bảng liệt kê tất cả bash commands mà Claude Code đã execute trong session, với đầy đủ metadata.

**Thông tin hiển thị:**

- Command text đầy đủ
- Exit code (success/fail)
- Duration chạy command
- Timestamp
- stdout/stderr snippet (collapsible)

**Animation & Visual:**

- **Mỗi command là 1 card** slide vào từ phải với stagger animation
- **Status indicator:** Viền trái card — xanh lá thick border cho success, đỏ cho fail, vàng cho đang chạy
- **Copy button** bên phải mỗi card — click thì button biến thành checkmark ✓ với morph animation + "Copied!" tooltip fade in/out
- **Failed command:** Card rung lắc nhẹ (shake animation) + background đỏ nhạt pulse
- **Running command:** Shimmer loading effect chạy qua card từ trái sang phải (skeleton loading style)
- **"Copy All as Script" button** ở cuối — click tạo shell script từ tất cả commands, button ripple effect
- **Duration bar** mini ở dưới mỗi card — thanh ngang tỉ lệ với thời gian chạy, dài = chạy lâu

---

### 7. ☠️ Error Graveyard — Error Tracker

**Mô tả:** Nghĩa trang cho errors — mỗi error là một bia mộ, visual hóa lỗi một cách vui nhộn thay vì khô khan.

**Thông tin hiển thị:**

- Error message tóm tắt
- Error type/category
- Timestamp
- File + line number liên quan
- Trạng thái: chưa fix / đã fix

**Animation & Visual:**

- **Mỗi error = 1 tombstone** 🪦 hiện lên từ dưới đất (translateY animation + slight rotation)
- **Tombstone design:** Hình bia mộ cartoon với error message khắc trên đó, RIP + timestamp
- **Skull counter** ở góc: "☠️ x3" với số đếm tăng kèm scale bounce mỗi lần error mới
- **Kill streak effect:** 3 errors liên tiếp → "TRIPLE KILL" text flash, 5 errors → skull to lên chiếm cả panel với đôi mắt đỏ glow
- **Fix animation:** Khi error được fix, tombstone chìm xuống đất (reverse animation) + hiệu ứng sparkle ✨ bay lên — "REST IN PEACE"
- **Background:** Sương mù nhẹ (CSS animated fog overlay) + màu tối dần khi error nhiều
- **Ambient:** Mặt trăng nhỏ ở góc panel, sáng hơn khi đêm (theo system time)

---

### 8. 📡 Context Window Gauge

**Mô tả:** Hiển thị % context window đã sử dụng — thông tin cực kỳ quan trọng mà Claude Code không show rõ ràng.

**Thông tin hiển thị:**

- % context window đã dùng
- Số tokens còn lại
- Dự đoán: "Còn ~X turns trước khi đầy"
- Warning levels

**Animation & Visual:**

- **Bình chứa chất lỏng** (liquid fill gauge) — hình bình thí nghiệm/bình nước
- **Nước dâng lên** smooth animation khi context tăng, với wave effect trên mặt nước (sine wave CSS animation)
- **Màu nước thay đổi:** Xanh dương (< 50%) → Vàng (50-80%) → Đỏ (> 80%) với smooth color transition
- **Bong bóng** 🫧 nhỏ bay lên trong nước (bubble particles)
- **Warning state (>80%):** Nước sóng sánh mạnh hơn + viền bình glow đỏ pulse + text "⚠️ CONTEXT ALMOST FULL" shake nhẹ
- **Critical state (>95%):** Background panel flash đỏ + alarm icon xoay
- **Overflow animation:** Nếu context đầy, nước tràn ra ngoài bình với splash effect

---

### 9. 💻 System Vitals — Resource Monitor

**Mô tả:** Monitor tài nguyên hệ thống real-time — CPU, RAM, Disk I/O liên quan đến Claude Code process.

**Thông tin hiển thị:**

- CPU usage % (overall + Claude Code process)
- RAM usage (used/total + Claude Code process)
- Disk I/O read/write speed
- Network throughput (bytes sent to Anthropic API)

**Animation & Visual:**

- **CPU: Circular progress ring** — vòng tròn fill theo % với gradient xanh→đỏ, rotation animation liên tục nhẹ
- **RAM: Liquid bar horizontal** — thanh ngang với chất lỏng fill + wave effect trên mặt, giống context gauge nhưng nằm ngang
- **Disk I/O: Dual sparkline** — 2 đường mini chart (read = xanh, write = cam) chạy real-time từ phải sang trái
- **Network: Pulse dots** — chuỗi dots di chuyển từ icon laptop → icon cloud, tốc độ dots = throughput
- **Idle state:** Tất cả gauges ở mức thấp, màu xanh dịu, nhịp chậm
- **High load:** Gauges đỏ lên + glow effect + subtle screen shake

---

### 10. 🏆 Session Scoreboard — Gamification

**Mô tả:** Gamify session làm việc — chấm điểm, rank, và achievement badges.

**Thông tin hiển thị:**

- Tổng files created / modified / deleted
- Tổng lines of code generated
- Tổng commands executed (success rate %)
- Longest error-free streak
- Productivity score tổng hợp
- Rank tier: Bronze → Silver → Gold → Platinum → Diamond

**Animation & Visual:**

- **Score counter** đếm lên kiểu arcade game — mỗi số flip animation (như bảng điểm cũ)
- **Rank badge** ở giữa — icon shield/medal với tier color, khi rank up thì burst animation sáng chói + confetti 🎉
- **Progress bar đến rank tiếp theo** — fill animation smooth + shimmer effect trên phần đã fill
- **Stat cards** xếp grid — mỗi card có icon + số + mini trend arrow (↑↓), hover thì card flip 3D reveal chi tiết
- **Achievement popup** khi đạt milestone: toast notification slide từ góc phải + icon bounce + sound ding
- **Streak fire:** Error-free streak counter có lửa nhỏ 🔥 bên cạnh, lửa to dần theo streak length

---

### 11. 🌡️ Vibe Indicator — Session Mood

**Mô tả:** Emoji/icon lớn phản ánh "mood" tổng thể của session dựa trên các metrics.

**Thông tin hiển thị:**

- Trạng thái hiện tại qua emoji
- Lý do trạng thái (ví dụ: "Error rate cao" → mood xấu)

**Bảng trạng thái & Animation:**

| Trạng thái | Emoji | Trigger | Animation |
|---|---|---|---|
| Shipping Fast | 🚀 | Nhiều file created, ít error | Rocket bay từ dưới lên, trail khói phía sau, stars whoosh qua |
| On Fire | 🔥 | Token burn rate cao | Lửa cháy animation loop, background hơi cam, heat distortion |
| Bug Hell | 💀 | 3+ errors liên tiếp | Skull lắc lắc, mắt đỏ glow, background tối dần |
| Idle | 😴 | Không activity > 2 phút | Zzz text float lên mờ dần, nhịp heartbeat chậm |
| Focused | 🎯 | Activity đều, ít error | Crosshair pulse nhẹ, ring sáng xung quanh, calm green glow |
| Money Burn | 💸 | Cost vượt threshold | Dollar bills rơi như lá, bill flutter animation |
| Victory | 🏆 | Hoàn thành task lớn | Confetti burst + trophy bounce + gold shimmer |

**Transition:** Khi đổi mood → emoji cũ shrink + fade, emoji mới grow từ center + bounce overshoot

---

### 12. 📸 Export & Flex Mode

**Mô tả:** Chế độ đặc biệt để capture dashboard đẹp nhất có thể cho mục đích "khoe" trên social media.

**Tính năng:**

- **Screenshot Mode:** 1 click → render dashboard thành PNG đẹp với background gradient, bo tròn góc, shadow — sẵn sàng post Facebook/Twitter
- **Summary Card:** Auto-generate 1 card tóm tắt session: "Built X files | Used Y tokens ($Z) | Rank: Gold" với design đẹp
- **Markdown Export:** Xuất session report dạng .md cho blog
- **Share Link:** Generate static HTML page của dashboard snapshot, host local hoặc share

**Animation khi Export:**

- Click export → Camera shutter animation (màn hình flash trắng nhẹ + shutter sound)
- Progress: Film strip animation chạy qua trong khi đang render
- Done: Preview thumbnail hiện lên với bounce + "Saved! 📸" toast notification

---

## 🎨 Theme System

Dashboard hỗ trợ nhiều themes, mỗi theme thay đổi toàn bộ color palette + animation style:

| Theme | Vibe | Colors | Đặc biệt |
|---|---|---|---|
| **Cyberpunk** | Neon city | Hồng neon, xanh cyan, tím trên nền tối | Glitch effects random, neon glow mạnh |
| **Matrix** | Hacker | Xanh lá trên nền đen | Matrix rain background, monospace font |
| **Synthwave** | Retro 80s | Tím, hồng, cam gradient | Grid perspective background, sun animation |
| **Nord** | Clean & calm | Xanh pastel, trắng | Minimal animation, aurora borealis subtle |
| **Dracula** | Dark elegant | Tím đậm, hồng, xanh lá | Bat icon thay vì emoji, gothic font headers |
| **Terminal Green** | Old school | Xanh lá phosphor trên đen | CRT scanline overlay, screen curvature effect |

---

## ⌨️ Hotkeys & Controls

| Phím | Hành động |
|---|---|
| `T` | Toggle theme (cycle qua các themes) |
| `S` | Screenshot mode |
| `F` | Fullscreen toggle |
| `M` | Mute/unmute sound effects |
| `1-9` | Focus vào panel tương ứng (phóng to) |
| `Esc` | Thoát focus, về layout mặc đặc |
| `E` | Export markdown summary |
| `R` | Reset session data |

---

## 📐 Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│              🎨 PROJECT BANNER (ASCII Art)               │
│         Rainbow gradient + Glitch effect + Branch        │
├────────────────────┬──────────────────┬─────────────────┤
│   🔥 TOKEN BURN    │  📊 TOKEN FLOW   │  🌡️ VIBE       │
│   METER            │  WATERFALL       │  INDICATOR      │
│   (Speedometer     │  (Bar chart      │  (Emoji +       │
│    + fire           │   + gradient     │   mood          │
│    particles)       │   + ripple)      │   animation)    │
├────────────────────┼──────────────────┼─────────────────┤
│  🗺️ FILE HEATMAP   │  📡 CONTEXT      │  💻 SYSTEM      │
│  (Treemap +        │  WINDOW          │  VITALS         │
│   click→VSCode     │  (Liquid fill    │  (CPU ring +    │
│   + pulse glow)    │   + bubbles      │   RAM bar +     │
│                    │   + wave)        │   sparklines)   │
├────────────────────┴──────────────────┼─────────────────┤
│  🧰 COMMAND ARSENAL                   │  ☠️ ERROR       │
│  (Card list + copy buttons            │  GRAVEYARD      │
│   + status indicators                 │  (Tombstones    │
│   + shake on error)                   │   + skull       │
│                                       │   + fog)        │
├───────────────────────────────────────┴─────────────────┤
│              💓 SESSION HEARTBEAT (ECG line)             │
├─────────────────────────────────────────────────────────┤
│  🏆 SESSION SCOREBOARD  │  📸 EXPORT    │  ⌨️ HOTKEYS   │
│  (Score + Rank + Badge)  │  (Screenshot) │  (Quick ref)  │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Data Collection — CLI Backend

CLI cần collect các data sau để feed cho dashboard:

| Data | Nguồn | Cách lấy |
|---|---|---|
| Token usage | Claude Code output/log | Parse log file hoặc watch stdout |
| File changes | File system | `chokidar` / `fs.watch` trên project dir |
| Bash commands | Claude Code log | Parse command execution logs |
| Errors | Claude Code output | Regex detect error patterns |
| Git info | Git CLI | `git branch`, `git status`, `git log` |
| System metrics | OS | `os` module (CPU, RAM), `process` (per-process) |
| Context window | Claude Code log/API | Estimate từ token count tích lũy |
| Project info | File system | Read `package.json`, detect tech stack |

---

## 🧑‍💻 Target Users

- AI developers dùng Claude Code hàng ngày muốn monitor session
- Build-in-public creators cần visual đẹp để share trên social media
- Developers muốn optimize token usage và cost
- Bất kỳ ai thích "rice" setup và khoe terminal/dashboard đẹp

---

*XScope — Built with 🔥 by AI Builders, for AI Builders.*