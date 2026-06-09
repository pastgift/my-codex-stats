import * as vscode from 'vscode'
import { loadAuthData } from './auth/auth-manager'
import {
  createStatusBarItem,
  showAuthRequired,
  showAuthError,
  getStatusBarItem,
} from './ui/status-bar'
import {
  getCurrentAuthData,
  initializeMonitor,
  refreshStatusBarFromCache,
  updateUsage,
} from './services/usage-monitor'
import { registerCommands } from './commands'

let updateInterval: NodeJS.Timeout | undefined
let configurationChangeDisposable: vscode.Disposable | undefined

export function activate(context: vscode.ExtensionContext) {
  console.log('My Codex Stats is now active!')

  // Create status bar item
  const statusBarItem = createStatusBarItem()
  context.subscriptions.push(statusBarItem)

  // Register all commands
  registerCommands(context)

  configurationChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    handleConfigurationChange,
  )
  context.subscriptions.push(configurationChangeDisposable)

  // Load auth and start monitoring
  loadAuthAndStartMonitoring()
}

function handleConfigurationChange(event: vscode.ConfigurationChangeEvent) {
  const statusBarDisplayChanged =
    event.affectsConfiguration('myCodexStats.balanceDisplayMode') ||
    event.affectsConfiguration('myCodexStats.statusBarTemplate')

  if (statusBarDisplayChanged) {
    refreshStatusBarFromCache()
  }

  if (event.affectsConfiguration('myCodexStats.updateInterval')) {
    if (getCurrentAuthData()) {
      startPeriodicUpdates()
    }
  }
}

async function loadAuthAndStartMonitoring() {
  try {
    console.log('Loading auth and starting monitoring...')
    // Try to load auth data
    const authData = await loadAuthData()

    if (authData) {
      console.log('Auth data loaded successfully')

      // Initialize the monitor with auth data
      initializeMonitor(authData)

      // Update immediately
      console.log('Performing initial update...')
      await updateUsage()

      // Start periodic updates (default 5 minutes)
      startPeriodicUpdates()
    } else {
      console.log('No auth data found')
      showAuthRequired()
    }
  } catch (error) {
    console.error('Error loading auth:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    showAuthError()
  }
}

function startPeriodicUpdates() {
  const config = vscode.workspace.getConfiguration('myCodexStats')
  const intervalSeconds = config.get<number>('updateInterval') || 300
  console.log(`Setting update interval to ${intervalSeconds} seconds`)

  if (updateInterval) {
    clearInterval(updateInterval)
  }

  updateInterval = setInterval(async () => {
    console.log('Periodic update triggered')
    await updateUsage()
  }, intervalSeconds * 1000)
}

export function deactivate() {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  if (configurationChangeDisposable) {
    configurationChangeDisposable.dispose()
  }
  const statusBarItem = getStatusBarItem()
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
