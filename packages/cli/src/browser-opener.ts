/** Open URL in the default browser (cross-platform) */
export async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;

  let cmd: string[];
  if (platform === "darwin") {
    cmd = ["open", url];
  } else if (platform === "win32") {
    cmd = ["cmd", "/c", "start", url];
  } else {
    // Linux — try xdg-open
    cmd = ["xdg-open", url];
  }

  try {
    const proc = Bun.spawn(cmd, { stdout: "ignore", stderr: "ignore" });
    await proc.exited;
  } catch {
    // Silently fail — user can manually open the URL
  }
}
