# Chinese (Simplified) Language Pack for Antigravity

简体中文语言包，专为 **Antigravity IDE** 的专属功能提供中文翻译。

> ⚠️ 本语言包仅覆盖 Antigravity 独有的 UI 元素。VS Code 基础 UI 的中文翻译请配合安装微软官方的 [Chinese (Simplified) Language Pack](https://marketplace.visualstudio.com/items?itemName=MS-CEINTL.vscode-language-pack-zh-hans)。

## 覆盖范围

| 扩展 | 说明 | 翻译条目 |
|------|------|---------|
| Antigravity 核心 | AI 功能、登录、导入设置等 | 25+ |
| Browser Launcher | 内置浏览器 | 3 |
| Code Executor | 代码执行器 | 1 |
| Dev Containers | 开发容器 | 8 |
| Remote - SSH | 远程 SSH 连接 | 19 |
| Remote - WSL | WSL 连接 | 17 |

## 安装方式

### 方式一：从 VSIX 安装

1. 下载或打包 `.vsix` 文件
2. 在 Antigravity 中打开命令面板 (`Cmd+Shift+P`)
3. 搜索 **"Extensions: Install from VSIX..."**
4. 选择下载的 `.vsix` 文件
5. 重启 IDE

### 方式二：从源码安装

```bash
# 克隆仓库
git clone https://github.com/editorss/AntigravityChinesePack.git

# 安装 vsce 工具（如未安装）
npm install -g @vscode/vsce

# 打包
cd AntigravityChinesePack
vsce package

# 安装生成的 .vsix 文件
```

## 使用方式

安装后，使用命令面板设置显示语言：

1. `Cmd+Shift+P` 打开命令面板
2. 输入 **"Configure Display Language"**
3. 选择 **中文(简体)**
4. 重启 IDE

## 贡献

欢迎提交 Pull Request 改进翻译质量！

## License

[MIT](LICENSE)
