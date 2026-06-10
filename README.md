# My Codex Stats

My Codex Stats 是一个 VS Code 扩展，用于在状态栏查看 ChatGPT/Codex 的用量状态和速率限制信息。

扩展会读取本地 Codex 登录信息（`~/.codex/auth.json`），定时发送最小化请求，并从响应头中获取当前剩余额度、重置时间等信息。

## 主要功能

- 在 VS Code 状态栏显示 5 小时窗口和每周窗口的用量百分比，可配置显示已使用或剩余额度。
- 悬停状态栏项查看账号、套餐、重置时间等详细信息。
- 支持点击状态栏项手动刷新。
- 支持按配置间隔自动刷新。
- 支持配置 HTTP/HTTPS 代理访问 Codex API。

## 使用前提

- 已安装 VS Code。
- 已通过 `codex login` 登录 Codex。
- 本地存在 Codex 认证文件：`~/.codex/auth.json`。

## 开发与构建

安装依赖：

```bash
npm install
```

编译扩展：

```bash
npm run compile
```

在 VS Code 中按 `F5` 可启动扩展开发窗口。

打包 VSIX：

```bash
npm run vscode:package
```

## 配置项

- `myCodexStats.updateInterval`：自动刷新间隔，单位为秒，默认 `300`。
- `myCodexStats.balanceDisplayMode`：状态栏百分比显示模式，可选 `Used` 或 `Remaining`，默认 `Remaining`。
- `myCodexStats.statusBarTemplate`：状态栏展示模板，默认 `{5h} · {5h.left} / {week} · {week.next}`。图标会自动显示在模板前方，并与模板之间保留 1 个空格。
- `myCodexStats.proxyUrl`：Codex API 请求代理地址，默认留空。
- `myCodexStats.model`：用于最小化请求的模型名称，默认 `gpt-5.4-mini`。

模板支持以下占位符：

- `{account}`：当前登录账号，优先显示邮箱；邮箱不可用时显示账号 ID。
- `{5h}`：5 小时额度。
- `{week}`：周额度。
- `{5h.bar}`：5 小时额度进度条，5 格显示，`100%` 为 `█████`，`0%` 为 `░░░░░`。
- `{week.bar}`：周额度进度条，5 格显示，`100%` 为 `█████`，`0%` 为 `░░░░░`。
- `{5h.next}`：5 小时重置时间点，格式为 `HH:mm`。
- `{5h.left}`：5 小时重置剩余时间，大于等于 1 小时显示小时数，不足 1 小时显示分钟数。
- `{week.next}`：周重置日期，格式为 `MM-DD`。
- `{week.left}`：周重置剩余时间，大于等于 1 天显示天数，不足 1 天显示小时数，不足 1 小时显示分钟数。

## 项目来源

本项目由原作者项目 [Maol-1997/codex-stats](https://github.com/Maol-1997/codex-stats) 修改而来。
