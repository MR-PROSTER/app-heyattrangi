/**
 * Format milliseconds as a calm human duration, e.g. "2 min 4 sec".
 */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60

  if (minutes === 0) {
    return seconds === 1 ? "1 second" : `${seconds} seconds`
  }
  if (seconds === 0) {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`
  }
  const minPart = minutes === 1 ? "1 min" : `${minutes} min`
  const secPart = seconds === 1 ? "1 sec" : `${seconds} sec`
  return `${minPart} ${secPart}`
}

export function formatMinutesApprox(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000))
  return minutes === 1 ? "1 minute" : `${minutes} minutes`
}
