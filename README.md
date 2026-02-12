# Chinese (Simplified) Language Pack for Antigravity

简体中文语言包，专为 **Antigravity IDE** 的专属功能提供中文翻译。

> ⚠️ 本语言包仅覆盖 Antigravity 独有的 UI 元素。VS Code 基础 UI 的中文翻译请配合安装微软官方的 [Chinese (Simplified) Language Pack](https://marketplace.visualstudio.com/items?itemName=MS-CEINTL.vscode-language-pack-zh-hans)。

## ✨ 功能特性

- **NLS 翻译** — 通过标准本地化机制翻译扩展 UI 字符串
- **硬编码补丁引擎** — 自动替换源码中的硬编码英文字符串为中文（Settings / Chat / Workbench 三大模块，1000+ 处翻译）
- **屏蔽自动更新** — 可选关闭 Antigravity 的自动更新检测，防止当前版本被覆盖
- **状态栏指示** — 右下角盾牌图标实时显示更新屏蔽状态，点击即可切换

## 覆盖范围

### NLS 翻译

| 扩展 | 说明 | 翻译条目 |
|------|------|---------| 
| Antigravity 核心 | AI 功能、登录、导入设置等 | 25+ |
| Browser Launcher | 内置浏览器 | 3 |
| Code Executor | 代码执行器 | 1 |
| Dev Containers | 开发容器 | 8 |
| Remote - SSH | 远程 SSH 连接 | 19 |
| Remote - WSL | WSL 连接 | 17 |

### 硬编码补丁

| 模块 | 目标文件 | 翻译条目 |
|------|----------|---------|
| Settings | `out/jetskiAgent/main.js` | 150+ |
| Chat | `extensions/antigravity/out/media/chat.js` | 800+ |
| Workbench | `out/vs/workbench/workbench.desktop.main.js` | 120+ |

## 安装方式

### 方式一：从 Release 下载

1. 前往 [Releases](https://github.com/editorss/AntigravityChinesePack/releases) 下载最新 `.vsix` 文件
2. 在 Antigravity 中打开命令面板 (`Cmd+Shift+P`)
3. 搜索 **"Extensions: Install from VSIX..."**
4. 选择下载的 `.vsix` 文件
5. 重启 IDE

### 方式二：从源码打包

```bash
git clone https://github.com/editorss/AntigravityChinesePack.git
cd AntigravityChinesePack
npx -y @vscode/vsce package --no-dependencies
# 安装生成的 .vsix 文件
```

## 使用方式

安装后，使用命令面板设置显示语言：

1. `Cmd+Shift+P` 打开命令面板
2. 输入 **"Configure Display Language"**
3. 选择 **中文(简体)**
4. 重启 IDE

## 可用命令

通过 `Cmd+Shift+P` 打开命令面板，搜索 **"Antigravity 中文"** 即可看到所有命令：

| 命令 | 说明 |
|------|------|
| `应用中文汉化补丁` | 将硬编码字符串替换为中文（自动在启动时执行） |
| `恢复英文原始文件` | 恢复所有被补丁修改的文件为英文原始版本 |
| `切换屏蔽 Antigravity 自动更新` | 开启/关闭自动更新检测屏蔽 |

### 屏蔽自动更新

开启后，Antigravity 将不再检查和下载新版本。适用于希望锁定当前版本的用户。

- **命令面板**：搜索"切换屏蔽 Antigravity 自动更新"
- **状态栏**：点击右下角 `🛡 更新正常` / `更新已屏蔽` 图标
- **设置面板**：Settings → 搜索 `blockAutoUpdate`

> ⚠️ 屏蔽更新后将无法收到安全补丁和新版本通知，请谨慎使用。

## 贡献

欢迎提交 Pull Request 改进翻译质量！

## License

[MIT](LICENSE)
