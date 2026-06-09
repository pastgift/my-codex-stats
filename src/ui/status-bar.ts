import * as vscode from 'vscode'
import { AuthData, RateLimits, RateLimitWindow } from '../types'
import { formatStatusBarResetDate } from '../utils/time-formatter'

let statusBarItem: vscode.StatusBarItem
const UPDATING_SUFFIX = ' ...'
const DEFAULT_STATUS_BAR_TEMPLATE = '{5h} · {5h.left} / {week} · {week.next}'
const BALANCE_BAR_LENGTH = 10
const BALANCE_BAR_FILLED = '█'
const BALANCE_BAR_EMPTY = '░'
type BalanceDisplayMode = 'Used' | 'Remaining'

/**
 * Create and initialize the status bar item
 */
export function createStatusBarItem(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  )

  statusBarItem.text = '$(codex-blossom)'
  statusBarItem.command = 'my-codex-stats.refresh'
  statusBarItem.show()

  return statusBarItem
}

/**
 * Update status bar with rate limits data
 */
export function updateStatusBar(rateLimits: RateLimits, authData?: AuthData) {
  const balanceDisplayMode = getBalanceDisplayMode()
  const templateContent = renderStatusBarTemplate(
    rateLimits,
    balanceDisplayMode,
    authData,
  )

  // Update status bar text with custom icon - no colors
  statusBarItem.text = `$(codex-blossom) ${templateContent}`
  statusBarItem.color = undefined
  statusBarItem.backgroundColor = undefined

}

/**
 * Show authentication required state
 */
export function showAuthRequired() {
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
  statusBarItem.command = 'my-codex-stats.refresh'
}

/**
 * Show authentication error state
 */
export function showAuthError() {
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
}

/**
 * Show updating state
 */
export function showUpdating() {
  const currentText = statusBarItem.text || '$(codex-blossom)'
  const baseText = currentText.endsWith(UPDATING_SUFFIX)
    ? currentText.slice(0, -UPDATING_SUFFIX.length)
    : currentText

  statusBarItem.text = `${baseText}${UPDATING_SUFFIX}`
  statusBarItem.color = undefined // Reset color while updating
}

/**
 * Show fetch error state
 */
export function showFetchError() {
  statusBarItem.text = '$(warning)'
  statusBarItem.color = new vscode.ThemeColor('editorWarning.foreground')
}

/**
 * Show update error state
 */
export function showUpdateError() {
  statusBarItem.text = '$(warning)'
  statusBarItem.color = new vscode.ThemeColor('editorWarning.foreground')
}

/**
 * Get the status bar item
 */
export function getStatusBarItem(): vscode.StatusBarItem {
  return statusBarItem
}

function formatBalancePercent(
  rateLimit: RateLimitWindow | undefined,
  balanceDisplayMode: BalanceDisplayMode,
): string {
  const displayPercent = getDisplayBalancePercent(
    rateLimit,
    balanceDisplayMode,
  )

  if (displayPercent === undefined) {
    return '--%'
  }

  return `${displayPercent.toFixed(0)}%`
}

function formatBalanceBar(
  rateLimit: RateLimitWindow | undefined,
  balanceDisplayMode: BalanceDisplayMode,
): string {
  const displayPercent = getDisplayBalancePercent(
    rateLimit,
    balanceDisplayMode,
  )

  if (displayPercent === undefined) {
    return BALANCE_BAR_EMPTY.repeat(BALANCE_BAR_LENGTH)
  }

  const filledLength = Math.round(
    (displayPercent / 100) * BALANCE_BAR_LENGTH,
  )
  const emptyLength = BALANCE_BAR_LENGTH - filledLength

  return (
    BALANCE_BAR_FILLED.repeat(filledLength) +
    BALANCE_BAR_EMPTY.repeat(emptyLength)
  )
}

function getDisplayBalancePercent(
  rateLimit: RateLimitWindow | undefined,
  balanceDisplayMode: BalanceDisplayMode,
): number | undefined {
  if (!rateLimit) {
    return undefined
  }

  const usedPercent = Math.max(0, Math.min(100, rateLimit.used_percent))

  return balanceDisplayMode === 'Used' ? usedPercent : 100 - usedPercent
}

function getBalanceDisplayMode(): BalanceDisplayMode {
  const config = vscode.workspace.getConfiguration('myCodexStats')
  const balanceDisplayMode = config.get<string>('balanceDisplayMode')

  return balanceDisplayMode === 'Used' ? 'Used' : 'Remaining'
}

function renderStatusBarTemplate(
  rateLimits: RateLimits,
  balanceDisplayMode: BalanceDisplayMode,
  authData: AuthData | undefined,
): string {
  const replacements: Record<string, string> = {
    '{account}': formatAccount(authData),
    '{5h}': formatBalancePercent(rateLimits.primary, balanceDisplayMode),
    '{week}': formatBalancePercent(rateLimits.secondary, balanceDisplayMode),
    '{5h.bar}': formatBalanceBar(rateLimits.primary, balanceDisplayMode),
    '{week.bar}': formatBalanceBar(rateLimits.secondary, balanceDisplayMode),
    '{5h.next}': formatResetTimePoint(rateLimits.primary?.resets_in_seconds),
    '{5h.left}': formatResetLeftMinutes(
      rateLimits.primary?.resets_in_seconds,
    ),
    '{week.next}': formatStatusBarResetDate(
      rateLimits.secondary?.resets_in_seconds,
    ),
    '{week.left}': formatResetLeftHours(
      rateLimits.secondary?.resets_in_seconds,
    ),
  }

  return Object.entries(replacements).reduce(
    (result, [placeholder, value]) => result.split(placeholder).join(value),
    getStatusBarTemplate(),
  )
}

function formatAccount(authData: AuthData | undefined): string {
  if (!authData) {
    return '--'
  }

  const email = authData.email?.trim()
  if (email && email.toLowerCase() !== 'unknown') {
    return email
  }

  const accountId = authData.accountId?.trim()
  return accountId || '--'
}

function getStatusBarTemplate(): string {
  const config = vscode.workspace.getConfiguration('myCodexStats')
  const template = config.get<string>('statusBarTemplate')?.trim()

  return template || DEFAULT_STATUS_BAR_TEMPLATE
}

function formatResetTimePoint(seconds?: number): string {
  if (seconds === undefined) {
    return '--:--'
  }

  const resetDate = new Date(Date.now() + Math.max(0, seconds) * 1000)
  const hours = String(resetDate.getHours()).padStart(2, '0')
  const minutes = String(resetDate.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

function formatResetLeftMinutes(seconds?: number): string {
  if (seconds === undefined) {
    return '-- min'
  }

  const safeSeconds = Math.max(0, seconds)

  if (safeSeconds >= 3600) {
    return `${Math.ceil(safeSeconds / 3600)} h`
  }

  return `${Math.ceil(safeSeconds / 60)} min`
}

function formatResetLeftHours(seconds?: number): string {
  if (seconds === undefined) {
    return '-- h'
  }

  const safeSeconds = Math.max(0, seconds)

  if (safeSeconds >= 86400) {
    return `${Math.ceil(safeSeconds / 86400)} d`
  }

  if (safeSeconds >= 3600) {
    return `${Math.ceil(safeSeconds / 3600)} h`
  }

  return `${Math.ceil(safeSeconds / 60)} min`
}
