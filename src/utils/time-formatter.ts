/**
 * Format reset time in human-readable format
 */
export function formatResetTime(seconds: number): string {
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (minutes > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  } else {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    if (hours > 0) {
      return `${days}d ${hours}h`
    }
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }
}

export function formatStatusBarResetDuration(seconds?: number): string {
  if (seconds === undefined) {
    return '--'
  }

  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)

  return `${minutes} min`
}

export function formatStatusBarResetDate(seconds?: number): string {
  if (seconds === undefined) {
    return '--'
  }

  const resetDate = new Date(Date.now() + Math.max(0, seconds) * 1000)
  const month = String(resetDate.getMonth() + 1).padStart(2, '0')
  const day = String(resetDate.getDate()).padStart(2, '0')

  return `${month}-${day}`
}
