import * as vscode from 'vscode'
import { RateLimits, RateLimitWindow } from '../types'
import {
  formatStatusBarResetDate,
  formatStatusBarResetDuration,
} from '../utils/time-formatter'

let statusBarItem: vscode.StatusBarItem
const UPDATING_SUFFIX = ' ...'

/**
 * Create and initialize the status bar item
 */
export function createStatusBarItem(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  )

  statusBarItem.text = '$(codex-blossom)'
  statusBarItem.command = 'codex-usage.refresh'
  statusBarItem.show()

  return statusBarItem
}

/**
 * Update status bar with rate limits data
 */
export function updateStatusBar(rateLimits: RateLimits) {
  const primaryRemaining = formatRemainingPercent(rateLimits.primary)
  const secondaryRemaining = formatRemainingPercent(rateLimits.secondary)
  const primaryReset = formatStatusBarResetDuration(
    rateLimits.primary?.resets_in_seconds,
  )
  const secondaryReset = formatStatusBarResetDate(
    rateLimits.secondary?.resets_in_seconds,
  )

  // Update status bar text with custom icon - no colors
  statusBarItem.text = `$(codex-blossom) ${primaryRemaining} · ${primaryReset} / ${secondaryRemaining} · ${secondaryReset}`
  statusBarItem.color = undefined
  statusBarItem.backgroundColor = undefined

}

/**
 * Show authentication required state
 */
export function showAuthRequired() {
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
  statusBarItem.command = 'codex-usage.refresh'
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

function formatRemainingPercent(rateLimit?: RateLimitWindow): string {
  if (!rateLimit) {
    return '--%'
  }

  const remainingPercent = Math.max(
    0,
    Math.min(100, 100 - rateLimit.used_percent),
  )

  return `${remainingPercent.toFixed(0)}%`
}
