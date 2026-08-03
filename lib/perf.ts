/**
 * Lightweight server/client performance logging for load-path diagnostics.
 * Enabled when NODE_ENV=development or PERF_LOG=1.
 */
const ENABLED =
  process.env.PERF_LOG === "1" || process.env.NODE_ENV === "development"

export function perfLog(label: string, durationMs: number, extra?: Record<string, unknown>) {
  if (!ENABLED) return
  const rounded = Math.round(durationMs)
  const suffix = extra ? ` ${JSON.stringify(extra)}` : ""
  console.info(`[perf] ${label}: ${rounded}ms${suffix}`)
  if (rounded > 500) {
    console.warn(`[perf] SLOW (>500ms) ${label}: ${rounded}ms — investigate DB/auth waterfall or overfetch`)
  }
}

export async function withPerf<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  try {
    return await fn()
  } finally {
    perfLog(label, performance.now() - start)
  }
}
