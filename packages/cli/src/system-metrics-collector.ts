import { cpus, totalmem, freemem } from "node:os";
import type { SystemVitals } from "@xscope/shared";

let prevCpuIdle = 0;
let prevCpuTotal = 0;

/** Collect current system CPU and RAM metrics */
export function collectSystemVitals(): SystemVitals {
  // CPU usage via delta between snapshots
  const cpuInfo = cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpuInfo) {
    idle += cpu.times.idle;
    total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
  }

  let cpuUsagePercent = 0;
  if (prevCpuTotal > 0) {
    const idleDelta = idle - prevCpuIdle;
    const totalDelta = total - prevCpuTotal;
    cpuUsagePercent = totalDelta > 0 ? Math.round((1 - idleDelta / totalDelta) * 100) : 0;
  }
  prevCpuIdle = idle;
  prevCpuTotal = total;

  // RAM usage
  const totalMb = Math.round(totalmem() / 1024 / 1024);
  const freeMb = Math.round(freemem() / 1024 / 1024);
  const usedMb = totalMb - freeMb;

  return {
    cpuUsagePercent,
    ramUsedMb: usedMb,
    ramTotalMb: totalMb,
    diskReadBytesPerSec: 0,
    diskWriteBytesPerSec: 0,
    networkBytesSent: 0,
    timestamp: new Date().toISOString(),
  };
}
