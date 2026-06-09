import * as vscode from 'vscode'
import { CodexAPIClient } from '../codex-client'
import { AuthData, RateLimits, RateLimitWindow } from '../types'
import {
  updateStatusBar,
  showUpdating,
  showFetchError,
  showUpdateError,
} from '../ui/status-bar'

let apiClient: CodexAPIClient | undefined
let currentAuthData: AuthData | undefined
let cachedRateLimits: RateLimits | undefined
let cachedRateLimitsAt: number | undefined

/**
 * Initialize the usage monitor with authentication data
 */
export function initializeMonitor(authData: AuthData) {
  currentAuthData = authData
  apiClient = new CodexAPIClient(authData, getProxyUrl(), getModel())
}

/**
 * Update usage statistics
 */
export async function updateUsage() {
  console.log('updateUsage called')
  console.log('apiClient exists:', !!apiClient)
  console.log('currentAuthData exists:', !!currentAuthData)

  if (!apiClient || !currentAuthData) {
    console.log('Missing apiClient or authData, returning')
    return
  }

  try {
    console.log('Setting status bar to updating...')
    showUpdating()

    // Send a simple message to get rate limits
    console.log('Calling getRateLimits...')
    apiClient.setProxyUrl(getProxyUrl())
    apiClient.setModel(getModel())
    const rateLimits = await apiClient.getRateLimits()
    console.log('getRateLimits returned:', rateLimits)

    if (rateLimits) {
      cachedRateLimits = rateLimits
      cachedRateLimitsAt = Date.now()
      updateStatusBar(cachedRateLimits, currentAuthData)
    } else {
      console.log('No rate limits received')
      showFetchError()
    }
  } catch (error) {
    console.error('Error updating usage:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    showUpdateError()
  }
}

/**
 * Get current auth data
 */
export function getCurrentAuthData(): AuthData | undefined {
  return currentAuthData
}

export function refreshStatusBarFromCache(): boolean {
  if (!cachedRateLimits) {
    return false
  }

  updateStatusBar(
    getDisplayRateLimits(cachedRateLimits, cachedRateLimitsAt),
    currentAuthData,
  )
  return true
}

function getDisplayRateLimits(
  rateLimits: RateLimits,
  cachedAt: number | undefined,
): RateLimits {
  if (cachedAt === undefined) {
    return rateLimits
  }

  const elapsedSeconds = Math.floor((Date.now() - cachedAt) / 1000)

  return {
    primary: getDisplayRateLimitWindow(rateLimits.primary, elapsedSeconds),
    secondary: getDisplayRateLimitWindow(rateLimits.secondary, elapsedSeconds),
  }
}

function getDisplayRateLimitWindow(
  rateLimit: RateLimitWindow | undefined,
  elapsedSeconds: number,
): RateLimitWindow | undefined {
  if (!rateLimit) {
    return undefined
  }

  if (rateLimit.resets_in_seconds === undefined) {
    return { ...rateLimit }
  }

  return {
    ...rateLimit,
    resets_in_seconds: Math.max(
      0,
      rateLimit.resets_in_seconds - elapsedSeconds,
    ),
  }
}

function getProxyUrl(): string | undefined {
  const config = vscode.workspace.getConfiguration('myCodexStats')
  const proxyUrl = config.get<string>('proxyUrl')?.trim()

  return proxyUrl || undefined
}

function getModel(): string {
  const config = vscode.workspace.getConfiguration('myCodexStats')
  const model = config.get<string>('model')?.trim()

  return model || 'gpt-5.4-mini'
}
