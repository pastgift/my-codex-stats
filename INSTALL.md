# Installation Instructions

## Quick Install

1. **Install dependencies:**

   ```bash
   cd my-codex-stats
   npm install
   ```

2. **Compile the extension:**

   ```bash
   npm run compile
   ```

3. **Test in VS Code:**
   - Open the `my-codex-stats` folder in VS Code
   - Press `F5` to launch a new VS Code window with the extension loaded
   - You should see the My Codex Stats indicator in the status bar (bottom right)

## Building for Distribution

1. **Install vsce (Visual Studio Code Extension manager):**

   ```bash
   npm install -g vsce
   ```

2. **Package the extension:**

   ```bash
   cd my-codex-stats
   vsce package
   ```

   This will create a `my-codex-stats-0.0.1.vsix` file

3. **Install the extension in VS Code:**
   - Open VS Code
   - Go to Extensions view (`Cmd+Shift+X` or `Ctrl+Shift+X`)
   - Click on the `...` menu at the top of the Extensions view
   - Select "Install from VSIX..."
   - Select the `my-codex-stats-0.0.1.vsix` file

## First Time Setup

1. **Make sure you're logged in to Codex:**

   ```bash
   codex login
   ```

2. **Reload VS Code window:**

   - Press `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux)
   - Or use Command Palette: "Developer: Reload Window"

3. **Check the status bar:**
   - You should see a quota percentage indicator (e.g., "50% (2h 30m) / 70% (06-11)")
   - Hover over it to see detailed information
   - Click it to manually refresh

## Troubleshooting

**Using a proxy:**

- Open VS Code Settings and search for "My Codex Stats Proxy Url"
- Set `myCodexStats.proxyUrl` to your proxy address, for example `http://127.0.0.1:7890`
- Leave it empty to connect directly
- Click the status bar item to force refresh after changing the setting

**Changing percentage display mode:**

- Open VS Code Settings and search for "My Codex Stats Balance Display Mode"
- Set `myCodexStats.balanceDisplayMode` to `Remaining` to show remaining quota, or `Used` to show used quota
- Click the status bar item to force refresh after changing the setting

**Changing status bar template:**

- Open VS Code Settings and search for "My Codex Stats Status Bar Template"
- Set `myCodexStats.statusBarTemplate` to a template such as `{5h} · {5h.left} / {week} · {week.next}`
- The blossom icon is always added automatically before your template, separated by one space
- Supported placeholders: `{account}`, `{5h}`, `{week}`, `{5h.bar}`, `{week.bar}`, `{5h.next}`, `{5h.left}`, `{week.next}`, `{week.left}`

**Unsupported model error:**

- The default request model is `gpt-5.4-mini`
- If your Codex account supports a different model, set `myCodexStats.model` to that model slug
- Click the status bar item to force refresh after changing the setting

**"Need to login" message:**

- Run `codex login` in terminal
- Make sure `~/.codex/auth.json` exists
- Reload VS Code window

**No status bar item visible:**

- Check the Output panel (`View > Output`)
- Select "My Codex Stats" from the dropdown
- Look for any error messages

**Rate limits not updating:**

- Click the status bar item to force refresh
- Check your internet connection
- Verify your auth token hasn't expired
