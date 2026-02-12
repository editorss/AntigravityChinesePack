// Antigravity IDE 中文汉化插件 - 自动补丁引擎
// 在插件激活时自动检测并应用硬编码字符串的中文翻译

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// 路径配置
// ═══════════════════════════════════════════════════════════════
function getAppBase() {
    // Antigravity.app 的 Resources/app 路径
    const candidates = [
        '/Applications/Antigravity.app/Contents/Resources/app',
        path.join(process.env.HOME || '', 'Applications/Antigravity.app/Contents/Resources/app'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    // Fallback: 从 vscode 的 appRoot 推导
    const appRoot = vscode.env.appRoot;
    if (appRoot && fs.existsSync(appRoot)) return appRoot;
    return null;
}

function getTargets(base) {
    return {
        settings: path.join(base, 'out', 'jetskiAgent', 'main.js'),
        chat: path.join(base, 'extensions', 'antigravity', 'out', 'media', 'chat.js'),
        workbench: path.join(base, 'out', 'vs', 'workbench', 'workbench.desktop.main.js'),
    };
}

// ═══════════════════════════════════════════════════════════════
// 替换规则定义
// ═══════════════════════════════════════════════════════════════

function getSettingsReplacements() {
    return [
        // === Agent Screen ===
        ['label:"Agent Auto-Fix Lints",description:"When enabled, Agent is given awareness of lint errors created by its edits and may fix them without explicit user prompt',
            'label:"Agent 自动修复 Lint",description:"启用后，Agent 会自动感知其编辑产生的 lint 错误，并可在无需用户明确提示的情况下修复它们'],
        ['label:"Strict Mode",description:"When enabled, enforces settings that prevent the agent from autonomously running targeted exploits and requires human review for all agent actions. Visit antigravity.google/docs/strict-mode for details.',
            'label:"严格模式",description:"启用后，将强制执行防止 Agent 自动运行目标漏洞利用的设置，并要求人工审核所有 Agent 操作。详见 antigravity.google/docs/strict-mode。'],
        ['label:"Review Policy",description:', 'label:"审查策略",description:'],
        ['label:"Terminal Command Auto Execution",description:', 'label:"终端命令自动执行",description:'],
        ['label:"Agent Gitignore Access",description:"Allow Agent to view and edit the files in .gitignore automatically. Use with caution if your .gitignore lists files cont',
            'label:"Agent Gitignore 访问",description:"允许 Agent 自动查看和编辑 .gitignore 中的文件。如果 .gitignore 中包含敏感凭据文件请谨慎使用'],
        ['label:"Agent Non-Workspace File Access",description:"Allow Agent to view and edit files outside of the current workspace automatically. Use with caution: this provides the A',
            'label:"Agent 非工作区文件访问",description:"允许 Agent 自动查看和编辑当前工作区之外的文件。请谨慎使用：这为 A'],
        ['label:"Auto-Continue",description:"When enabled, Agent will automatically continue its response when it reaches its per-response invocation limit.',
            'label:"自动继续",description:"启用后，当 Agent 达到每次响应的调用限制时，将自动继续其响应。'],
        ['label:"Enable Sounds for Agent",description:"When enabled, Antigravity will play a sound when Agent finishes generating a response.',
            'label:"Agent 声音提示",description:"启用后，Antigravity 会在 Agent 完成响应生成时播放声音。'],
        ['label:"Auto-Expand Changes Overview",description:"When enabled, the Changes Overview toolbar will automatically expand when Agent finishes generating a response.',
            'label:"自动展开更改概览",description:"启用后，当 Agent 完成响应生成时，更改概览工具栏将自动展开。'],
        ['label:"Conversation History",description:"When enabled, the agent will be able to access past conversations to inform its responses.',
            'label:"对话历史",description:"启用后，Agent 将能够访问过去的对话来辅助其响应。'],
        ['label:"Knowledge",description:"When enabled, the agent will be able to access its knowledge base to inform its responses and automatically generate kno',
            'label:"知识库",description:"启用后，Agent 将能够访问其知识库来辅助其响应并自动生成知'],
        ['label:"Auto-Open Edited Files",description:"Open files in the background if Agent creates or edits them"',
            'label:"自动打开已编辑文件",description:"当 Agent 创建或编辑文件时在后台打开它们"'],
        ['label:"Open Agent on Reload",description:"Open Agent panel on window reload"',
            'label:"重新加载时打开 Agent",description:"窗口重新加载时打开 Agent 面板"'],
        ['label:"Enable Terminal Sandbox",description:', 'label:"启用终端沙盒",description:'],
        ['label:"Sandbox Allow Network",description:', 'label:"沙盒允许网络",description:'],
        // === Editor Screen ===
        ['label:"Suggestions in Editor",description:"Show suggestions when typing in the editor"',
            'label:"编辑器中的建议",description:"在编辑器中输入时显示建议"'],
        ['label:"Show Selection Actions",description:', 'label:"显示选中操作",description:'],
        // === Tab Screen ===
        ['label:"Tab Speed",description:"Set the speed of tab suggestions"', 'label:"Tab 速度",description:"设置 Tab 建议的速度"'],
        ['label:"Tab to Jump",description:"Predict the location of your next edit and navigates you there with a tab keypress.',
            'label:"Tab 跳转",description:"预测下一个编辑位置，按 Tab 键即可跳转到该位置。'],
        ['label:"Tab to Import",description:"Quickly add and update imports with a tab keypress.',
            'label:"Tab 导入",description:"按 Tab 键快速添加和更新导入语句。'],
        ['label:"Highlight After Accept",description:"Highlight newly inserted text after accepting a Tab completion.',
            'label:"接受后高亮",description:"接受 Tab 补全后高亮新插入的文本。'],
        ['label:"Tab Gitignore Access",description:"Allow Tab to view and edit the files in .gitignore. Use with caution if your .gitignore lists files containing credentia',
            'label:"Tab Gitignore 访问",description:"允许 Tab 查看和编辑 .gitignore 中的文件。如果 .gitignore 中包含敏感凭据文件请谨慎使用'],
        // === Browser Screen ===
        ['label:"Enable Browser Tools",description:"When enabled, Agent can use browser tools to open URLs, read web pages, and interact with browser content. This allows t',
            'label:"启用浏览器工具",description:"启用后，Agent 可以使用浏览器工具打开 URL、读取网页并与浏览器内容互动。这允许'],
        ['label:"Browser Javascript Execution Policy",description:', 'label:"浏览器 JavaScript 执行策略",description:'],
        ['label:"Chrome Binary Path",description:"Path to the Chrome/Chromium executable. Leave empty for auto-detection.',
            'label:"Chrome 可执行文件路径",description:"Chrome/Chromium 可执行文件的路径。留空则自动检测。'],
        ['label:"Browser User Profile Path",description:"Custom path for the browser user profile directory. Leave empty for default (~/.gemini/antigravity-browser-profile).',
            'label:"浏览器用户配置路径",description:"浏览器用户配置文件目录的自定义路径。留空使用默认值（~/.gemini/antigravity-browser-profile）。'],
        ['label:"Browser CDP Port",description:"Port number for Chrome DevTools Protocol remote debugging. Leave empty for default (9222).',
            'label:"浏览器 CDP 端口",description:"Chrome DevTools Protocol 远程调试的端口号。留空使用默认值（9222）。'],
        ['label:"Browser URL Allowlist",description:"Control which URLs the browser can access. Add domains or full URLs to the allowlist.',
            'label:"浏览器 URL 允许列表",description:"控制浏览器可以访问的 URL。将域名或完整 URL 添加到允许列表。'],
        ['label:"Marketplace Item URL",description:', 'label:"市场扩展页面 URL",description:'],
        ['label:"Marketplace Gallery URL",description:', 'label:"市场搜索 URL",description:'],
        // === Allow/Deny List ===
        ['label:"Allow List Terminal Commands",description:"Agent auto-executes commands matched by an allow list entry.',
            'label:"终端命令允许列表",description:"Agent 自动执行与允许列表条目匹配的命令。'],
        ['label:"Deny List Terminal Commands",description:"Agent asks for permission before executing commands matched by a deny list entry.',
            'label:"终端命令拒绝列表",description:"Agent 在执行与拒绝列表条目匹配的命令之前会请求许可。'],
        // === Account Screen ===
        ['label:"Enable Telemetry",description:', 'label:"启用遥测",description:'],
        // === Review Policy Options ===
        ['{value:j0.TURBO,label:"Always Proceed",description:"Agent never asks for review. This maximizes the autonomy of the Agent, but also has the highest risk of the Agent operat',
            '{value:j0.TURBO,label:"始终继续",description:"Agent 从不请求审查。这最大化了 Agent 的自主性，但也具有 Agent 最高操作风'],
        ['{value:j0.AUTO,label:"Agent Decides",description:"Agent will decide when to ask for review based on task complexity and user preference.',
            '{value:j0.AUTO,label:"Agent 决定",description:"Agent 将根据任务复杂性和用户偏好决定何时请求审查。'],
        ['{value:j0.ALWAYS,label:"Request Review",description:"Agent always asks for review.',
            '{value:j0.ALWAYS,label:"请求审查",description:"Agent 始终请求审查。'],
        ['value:Zd.TURBO,children:"Always Proceed"', 'value:Zd.TURBO,children:"始终继续"'],
        ['value:Zd.AUTO,children:"Agent Decides"', 'value:Zd.AUTO,children:"Agent 决定"'],
        ['value:Zd.ALWAYS,children:"Request Review"', 'value:Zd.ALWAYS,children:"请求审查"'],
        // === Dev ===
        ['label:"[Dev] GCP Project ID",description:"GCP Project ID for enterprise features."',
            'label:"[开发] GCP 项目 ID",description:"企业功能的 GCP 项目 ID。"'],
        // === Settings Title ===
        ['children:["Settings - ",t]', 'children:["设置 - ",t]'],
        // === Conversation Mode ===
        ['children:"Conversation mode"', 'children:"对话模式"'],
        ['{mode:"Planning",description:"Agent can plan before executing tasks. Use for deep research, complex tasks, or collaborative work"}',
            '{mode:"Planning",description:"Agent 可以在执行任务前进行规划。适用于深度研究、复杂任务或协作工作"}'],
        ['{mode:"Fast",description:"Agent will execute tasks directly. Use for simple tasks that can be completed faster"}',
            '{mode:"Fast",description:"Agent 将直接执行任务。适用于可以更快完成的简单任务"}'],
        ['text:"Provide Feedback"', 'text:"提供反馈"'],
        // === Accept / Undo / Skip / Add / Edit / Loading ===
        ['children:"Accept"', 'children:"接受"'],
        ['children:"Accept all"', 'children:"全部接受"'],
        ['children:"Skip"', 'children:"跳过"'],
        ['children:"Add"', 'children:"添加"'],
        ['children:"Add Model"', 'children:"添加模型"'],
        ['children:"Add context"', 'children:"添加上下文"'],
        ['children:"Add them to allow future interactions"', 'children:"将它们添加到允许列表以允许未来的交互"'],
        ['children:"Edit"', 'children:"编辑"'],
        ['children:"Edit Model"', 'children:"编辑模型"'],
        ['children:"Editor"', 'children:"编辑器"'],
        ['children:"Editor Settings"', 'children:"编辑器设置"'],
        ['children:"Editor Window"', 'children:"编辑器窗口"'],
        ['children:"Loading..."', 'children:"加载中..."'],
        ['children:"Loading models..."', 'children:"正在加载模型..."'],
        ['children:"Loading Browser recording..."', 'children:"正在加载浏览器录制..."'],
        ['children:"Loading knowledge items..."', 'children:"正在加载知识项..."'],
        ['children:"Loading metrics..."', 'children:"正在加载指标..."'],
        ['label:"Undo"', 'label:"撤销"'],
        ['label:"Discard all changes"', 'label:"放弃所有更改"'],
        ['label:"Discard changes"', 'label:"放弃更改"'],
        ['label:"Run"', 'label:"运行"'],
        ['label:"Running"', 'label:"运行中"'],
        ['label:"Close"', 'label:"关闭"'],
        ['label:"Ran command"', 'label:"执行命令"'],
        ['label:"Close Workspace"', 'label:"关闭工作区"'],
        ['label:"Delete Conversation"', 'label:"删除对话"'],
        ['label:"Start Conversation"', 'label:"开始对话"'],
        ['label:"Open Workspace"', 'label:"打开工作区"'],
        ['label:"Open New Workspace"', 'label:"打开新工作区"'],
        ['label:"Open New Remote Workspace"', 'label:"打开新远程工作区"'],
        // === Start / Ask / Changes Overview / Expand / Thought / Auto-proceeded ===
        ['tooltip:"Start a new conversation"', 'tooltip:"开始新对话"'],
        ['text:"Start conversation"', 'text:"开始对话"'],
        ['children:"Proceed"', 'children:"继续"'],
        ['children:"Artifacts"', 'children:"产物"'],
        ['children:"Model"', 'children:"模型"'],
        ['children:"Expand All"', 'children:"全部展开"'],
        ['children:"Collapse All"', 'children:"全部折叠"'],
        // === Ask / Changes / Expand / Thought / Status (main.js uses same patterns) ===
        ['"Ask anything, @ to mention, / for workflows"', '"输入任何内容，@ 用于提及，/ 用于调用工作流"'],
        ['`Changes Overview (${d})`', '`更改概览 (${d})`'],
        ['`Terminal (${d})`', '`终端 (${d})`'],
        ['text:l?"Collapse all":"Expand all"', 'text:l?"全部折叠":"全部展开"'],
        ['`Thinking for ${TTe(t)}`', '`思考中 ${TTe(t)}`'],
        ['`Thought for ${', '`思考了 ${'],
        ['children:"Thought Process"', 'children:"思考过程"'],
        ['"Auto-proceeded by the agent under your review policy."', '"已由 Agent 根据您的审查策略自动继续。"'],
        ['"Manually proceeded under your review policy."', '"已根据您的审查策略手动继续。"'],
        ['["Generating","Working","Loading"]', '["生成中","工作中","加载中"]'],
        ['children:"Artifacts"', 'children:"产物"'],
        ['children:"Model"', 'children:"模型"'],
        ['children:"Proceed"', 'children:"继续"'],
        // === Batch 2: Artifacts / Audio / Send / Report ===
        ['children:"Artifacts are files the agent creates during a conversation to help perform longer running tasks and allow the user to provide high-level feedback. Click to open in editor."',
            'children:"产物是 Agent 在对话中创建的文件，用于帮助执行较长时间运行的任务并允许用户提供高级反馈。点击在编辑器中打开。"'],
        ['children:"Artifact Name"', 'children:"产物名称"'],
        ['children:"Last Updated"', 'children:"最后更新"'],
        ['`Artifacts (${n.length} Files for Conversation)`', '`产物 (${n.length} 个对话文件)`'],
        ['`Terminal (O Background Processes Running)`', '`终端 (O 个后台进程正在运行)`'],
        ['children:"Send"', 'children:"发送"'],
        ['"Audio is not supported for this model"', '"该模型不支持音频"'],
        ['"No microphone detected"', '"未检测到麦克风"'],
        // === Batch 3: Comment / Reject / Edit / Open Browser ===
        ['children:"Comment"', 'children:"评论"'],
        ['children:"Reject"', 'children:"拒绝"'],
        ['description:\'Show "Edit" and "Chat" buttons when selecting text in the editor.\'', 'description:\'在编辑器中选择文本时显示“编辑”和“聊天”按钮。\''],
        // === Batch 4: results 个结果 ===
        ['," result",a===1?"":"s"', '," 个结果"'],
        ['," result",t.resources.length===1?"":"s"', '," 个结果"'],
        ['," result",a.length===1?"":"s"," "', '," 个结果 "'],
    ];
}

function getChatReplacements() {
    return [
        // 1. Conversation Mode
        ['children:"Conversation mode"', 'children:"对话模式"'],
        ['{mode:"Planning",description:"Agent can plan before executing tasks. Use for deep research, complex tasks, or collaborative work"}',
            '{mode:"Planning",description:"Agent 可以在执行任务前进行规划。适用于深度研究、复杂任务或协作工作"}'],
        ['{mode:"Fast",description:"Agent will execute tasks directly. Use for simple tasks that can be completed faster"}',
            '{mode:"Fast",description:"Agent 将直接执行任务。适用于可以更快完成的简单任务"}'],
        // 2. Customizations / Rules / Workflows
        ['children:"Customizations"', 'children:"自定义"'],
        ['Customize Agent to get a better, more personalized experience.', '自定义 Agent 以获得更好、更个性化的体验。'],
        ['label:"Customizations"', 'label:"自定义"'],
        ['label:"MCP Servers"', 'label:"MCP 服务器"'],
        ['children:"Manage MCP Servers"', 'children:"管理 MCP 服务器"'],
        ['children:"Rules"', 'children:"规则"'],
        ['children:"Workflows"', 'children:"工作流"'],
        ['children:"Rules help guide the behavior of Agent."', 'children:"规则可以帮助引导 Agent 的行为。"'],
        ['children:"Edit rule"', 'children:"编辑规则"'],
        ['children:"Edit workflow"', 'children:"编辑工作流"'],
        ['children:"Refresh rules"', 'children:"刷新规则"'],
        ['children:"Refresh workflows"', 'children:"刷新工作流"'],
        ['label:"Rules"', 'label:"规则"'],
        ['label:"Workflows"', 'label:"工作流"'],
        ['label:"Mentions"', 'label:"提及"'],
        ['label:"Screen Recording"', 'label:"屏幕录制"'],
        // 3. Navigation
        ['"Back to Agent"', '"返回 Agent"'],
        ['children:"Close Agent View"', 'children:"关闭 Agent 视图"'],
        ['children:"Past Conversations"', 'children:"历史对话"'],
        ['children:"History"', 'children:"历史记录"'],
        ['children:"Delete Conversation"', 'children:"删除对话"'],
        ['children:"Connect to an existing conversation"', 'children:"连接到现有对话"'],
        // 4. Common Buttons
        ['children:"Cancel"', 'children:"取消"'],
        ['children:"Cancel command"', 'children:"取消命令"'],
        ['children:"Cancel step"', 'children:"取消步骤"'],
        ['children:"Confirm"', 'children:"确认"'],
        ['children:"Confirm Undo"', 'children:"确认撤销"'],
        ['children:"Close"', 'children:"关闭"'],
        ['children:"Create"', 'children:"创建"'],
        ['children:"Delete"', 'children:"删除"'],
        ['children:"Dismiss"', 'children:"忽略"'],
        ['children:"Expand"', 'children:"展开"'],
        ['children:"Install"', 'children:"安装"'],
        ['children:"Launch"', 'children:"启动"'],
        ['children:"Open"', 'children:"打开"'],
        ['children:"Ran command"', 'children:"执行命令"'],
        // 注意: 实际 chat.js 中是模板字面量 `Exit code ${e.exitCode}`，非双引号字符串
        ['Exit code ${e.exitCode}', '\\u9000\\u51FA\\u7801 ${e.exitCode}'],
        ['Ran command', '执行命令'],
        ['children:"Preview"', 'children:"预览"'],
        ['children:"Refresh"', 'children:"刷新"'],
        ['children:"Retry"', 'children:"重试"'],
        ['children:"Review"', 'children:"审查"'],
        ['children:"Review Changes"', 'children:"审查更改"'],
        ['children:"Save"', 'children:"保存"'],
        ['children:"Send"', 'children:"发送"'],
        ['children:"Send Feedback"', 'children:"发送反馈"'],
        ['children:"See all"', 'children:"查看全部"'],
        ['children:"Show more"', 'children:"显示更多"'],
        ['children:"Continue response"', 'children:"继续响应"'],
        ['children:"Configure"', 'children:"配置"'],
        ['children:"Configure Auto-Continue"', 'children:"配置自动继续"'],
        ['children:"Next"', 'children:"下一步"'],
        ['children:"Previous"', 'children:"上一步"'],
        ['children:"Reload IDE"', 'children:"重新加载 IDE"'],
        ['children:"Clear"', 'children:"清除"'],
        ['children:"Setup"', 'children:"设置"'],
        ['children:"New"', 'children:"新建"'],
        ['children:"Default"', 'children:"默认"'],
        ['children:"Custom"', 'children:"自定义"'],
        ['children:"Copy command"', 'children:"复制命令"'],
        ['children:"Copy diff"', 'children:"复制差异"'],
        ['children:"Copy the trajectory ID"', 'children:"复制轨迹 ID"'],
        ['children:"Open diff"', 'children:"打开差异"'],
        ['children:"Open in New Window"', 'children:"在新窗口中打开"'],
        ['children:"Open allowlist"', 'children:"打开允许列表"'],
        ['children:"Start Screen Recording"', 'children:"开始屏幕录制"'],
        ['children:"Set Browser Config"', 'children:"设置浏览器配置"'],
        ['children:"View Diff"', 'children:"查看差异"'],
        ['children:"View Page"', 'children:"查看页面"'],
        ['children:"View network request"', 'children:"查看网络请求"'],
        ['children:"View network requests"', 'children:"查看网络请求"'],
        ['children:"View plans"', 'children:"查看计划"'],
        ['children:"View Annotation"', 'children:"查看注释"'],
        ['children:"View Created Links"', 'children:"查看已创建链接"'],
        ['children:"View snapshot"', 'children:"查看快照"'],
        // 5. Status Messages
        ['children:"Thinking"', 'children:"思考中"'],
        ['children:"Analyzed"', 'children:"已分析"'],
        ['children:"Installed"', 'children:"已安装"'],
        ['children:"Error"', 'children:"错误"'],
        ['children:"Something went wrong"', 'children:"出了点问题"'],
        ['children:"An error was thrown."', 'children:"发生了一个错误。"'],
        ['children:"Failed to send"', 'children:"发送失败"'],
        ['children:"Launching the browser..."', 'children:"正在启动浏览器..."'],
        ['children:"Playback available"', 'children:"可以回放"'],
        ['children:"Preview unavailable"', 'children:"预览不可用"'],
        ['children:"No matching results"', 'children:"没有匹配的结果"'],
        ['children:"No results"', 'children:"无结果"'],
        ['children:"No results found"', 'children:"未找到结果"'],
        ['children:"No results found."', 'children:"未找到结果。"'],
        ['children:"No browser pages open"', 'children:"没有打开的浏览器页面"'],
        ['children:"Loading MCP servers"', 'children:"正在加载 MCP 服务器"'],
        ['children:"Loading models..."', 'children:"正在加载模型..."'],
        ['children:"Reconnecting to remote authority."', 'children:"正在重新连接到远程服务器。"'],
        ['children:"Disabled in strict mode"', 'children:"在严格模式下已禁用"'],
        ['children:"Full output written to"', 'children:"完整输出已写入"'],
        ['children:"Read URL rejected"', 'children:"读取 URL 被拒绝"'],
        ['children:"Rejected MCP tool"', 'children:"已拒绝 MCP 工具"'],
        ['children:"Proceeded with"', 'children:"已继续执行"'],
        ['children:"Unknown edit"', 'children:"未知编辑"'],
        ['children:"Unknown file edit"', 'children:"未知文件编辑"'],
        ['children:"Built-In"', 'children:"内置"'],
        // 6. Prompts
        ['children:"Authentication Required"', 'children:"需要身份验证"'],
        ['children:"Confirmation required to execute this step"', 'children:"执行此步骤需要确认"'],
        ['children:"Antigravity would like to use the browser."', 'children:"Antigravity 希望使用浏览器。"'],
        ['children:"The Agent attempted to interact with some sites that are not allowlisted"', 'children:"Agent 尝试与一些不在允许列表中的网站交互"'],
        ['children:"The agent was prevented from accessing some sites"', 'children:"Agent 已被阻止访问某些网站"'],
        ['children:"The agent will wait for you to install the browser extension."', 'children:"Agent 将等待你安装浏览器扩展。"'],
        ['children:"This plugin has been built by a verified reference publisher."', 'children:"此插件由经过验证的参考发布者构建。"'],
        ['children:"This plugin has been built by the official publisher."', 'children:"此插件由官方发布者构建。"'],
        ['children:"Read URL content?"', 'children:"读取 URL 内容？"'],
        ['children:"Run MCP tool call?"', 'children:"运行 MCP 工具调用？"'],
        ['children:"Modify the config used for browser interactions. Saved automatically."', 'children:"修改用于浏览器交互的配置。自动保存。"'],
        ['children:"After reporting the issue, reload your window to resume Agent use."', 'children:"报告问题后，重新加载窗口以恢复 Agent 使用。"'],
        ['children:"Files results show if their associated language extension is installed."', 'children:"文件结果会在安装了关联的语言扩展后显示。"'],
        ['children:"Select a trajectory"', 'children:"选择一个轨迹"'],
        // 7. Headers
        ['children:"Sources"', 'children:"来源"'],
        ['children:"Details"', 'children:"详细信息"'],
        ['children:"Features"', 'children:"功能"'],
        ['children:"Comments"', 'children:"评论"'],
        ['children:"Images"', 'children:"图片"'],
        ['children:"Files Edited"', 'children:"已编辑文件"'],
        ['children:"Background Steps"', 'children:"后台步骤"'],
        ['children:"Suggested Actions"', 'children:"建议操作"'],
        ['children:"Progress Updates"', 'children:"进度更新"'],
        ['children:"Thought Process"', 'children:"思考过程"'],
        ['children:"Pending messages"', 'children:"待处理消息"'],
        ['children:"Knowledge Generation"', 'children:"知识生成"'],
        ['children:"Recent actions"', 'children:"最近操作"'],
        ['children:"Report Issue"', 'children:"报告问题"'],
        ['children:"Conversation"', 'children:"对话"'],
        ['children:"Additional options"', 'children:"其他选项"'],
        ['children:"Feedback"', 'children:"反馈"'],
        ['children:"Denied Sites"', 'children:"被拒绝的网站"'],
        ['children:"Global"', 'children:"全局"'],
        ['children:"MCP Store"', 'children:"MCP 商店"'],
        // 8. Feedback
        ['children:"Good"', 'children:"好"'],
        ['children:"Bad"', 'children:"差"'],
        ['children:"Good response"', 'children:"好的响应"'],
        ['children:"Bad response"', 'children:"差的响应"'],
        // 9. Browser
        ['children:"Open System Browser"', 'children:"打开系统浏览器"'],
        ['children:"Fetched network request for page."', 'children:"已获取页面的网络请求。"'],
        ['children:"Fetched network requests for page."', 'children:"已获取页面的网络请求。"'],
        // 10. Labels
        ['label:"Complete verification"', 'label:"完成验证"'],
        ['label:"Copy"', 'label:"复制"'],
        ['label:"Paste"', 'label:"粘贴"'],
        ['label:"Export"', 'label:"导出"'],
        ['label:"Enable"', 'label:"启用"'],
        ['label:"Retry"', 'label:"重试"'],
        ['label:"Try again"', 'label:"再试一次"'],
        ['label:"Deny"', 'label:"拒绝"'],
        ['label:"Allow Once"', 'label:"允许一次"'],
        ['label:"Always Allow"', 'label:"始终允许"'],
        ['label:"Always run"', 'label:"始终运行"'],
        ['label:"Ask every time"', 'label:"每次询问"'],
        ['label:"Ask first"', 'label:"先询问"'],
        ['label:"Always Proceed"', 'label:"始终继续"'],
        ['label:"Request Review"', 'label:"请求审查"'],
        ['label:"Agent Decides"', 'label:"Agent 决定"'],
        ['label:"Download Diagnostics"', 'label:"下载诊断信息"'],
        ['label:"Copy debug info"', 'label:"复制调试信息"'],
        ['label:"Select Model"', 'label:"选择模型"'],
        ['label:"Select another model"', 'label:"选择其他模型"'],
        ['label:"Terminal"', 'label:"终端"'],
        ['label:"Media"', 'label:"媒体"'],
        ['label:"Errors"', 'label:"错误"'],
        ['label:"Conversation"', 'label:"对话"'],
        ['label:"Reject"', 'label:"拒绝"'],
        ['label:"Global"', 'label:"全局"'],
        ['label:"Workspace"', 'label:"工作区"'],
        ['label:"Free"', 'label:"免费"'],
        // 11. Titles
        ['title:"Verification required"', 'title:"需要验证"'],
        ['title:"Share Conversation"', 'title:"分享对话"'],
        ['title:"Enable Notifications"', 'title:"启用通知"'],
        ['title:"Select Model to Send Message"', 'title:"选择模型以发送消息"'],
        ['title:"Model quota limit exceeded"', 'title:"模型配额已超限"'],
        ['title:"Capture screenshot"', 'title:"截取屏幕"'],
        ['title:"Capture console logs"', 'title:"捕获控制台日志"'],
        ['title:"Confirm dismiss?"', 'title:"确认忽略？"'],
        ['title:"Could not send message"', 'title:"无法发送消息"'],
        ['title:"Your modified files:"', 'title:"你修改的文件："'],
        ['title:"Your recent Browser activity:"', 'title:"你最近的浏览器活动："'],
        ['title:"Your recent terminal commands:"', 'title:"你最近的终端命令："'],
        ['title:"View Page"', 'title:"查看页面"'],
        ['title:"Mention Page"', 'title:"提及页面"'],
        ['title:"Full Error"', 'title:"完整错误"'],
        ['title:"Comments"', 'title:"评论"'],
        ['title:"First page"', 'title:"第一页"'],
        ['title:"Last page"', 'title:"最后一页"'],
        ['title:"Next page"', 'title:"下一页"'],
        ['title:"Previous page"', 'title:"上一页"'],
        ['title:"Copy full URL to clipboard"', 'title:"复制完整 URL 到剪贴板"'],
        ['title:"Click to copy full command"', 'title:"点击复制完整命令"'],
        ['title:"Copy trajectory ID"', 'title:"复制轨迹 ID"'],
        // 12. Placeholders
        ['placeholder:"Search MCP servers"', 'placeholder:"搜索 MCP 服务器"'],
        // 13. Text
        ['text:"Go to Terminal"', 'text:"前往终端"'],
        ['text:"Open"', 'text:"打开"'],
        ['text:"Relocate"', 'text:"重新定位"'],
        // 14. Other
        ['children:"Allow Once"', 'children:"允许一次"'],
        ['children:"Allow This Conversation"', 'children:"本次对话允许"'],
        ['children:"Deny"', 'children:"拒绝"'],
        ['children:"Reject"', 'children:"拒绝"'],
        ['children:"Reject all"', 'children:"全部拒绝"'],
        ['children:"Learn more"', 'children:"了解更多"'],
        ['children:"file an issue"', 'children:"提交问题"'],
        ['children:"reload the window"', 'children:"重新加载窗口"'],
        ['children:"troubleshooting guide"', 'children:"故障排除指南"'],
        ['children:"Show items analyzed"', 'children:"显示已分析项目"'],
        // 15. Accept / Add / Edit
        ['children:"Accept"', 'children:"接受"'],
        ['children:"Accept all"', 'children:"全部接受"'],
        ['children:"Add Model"', 'children:"添加模型"'],
        ['children:"Add context"', 'children:"添加上下文"'],
        ['children:"Add them to allow future interactions"', 'children:"将它们添加到允许列表以允许未来的交互"'],
        ['children:"Added Annotation"', 'children:"已添加注释"'],
        ['children:"Edit Model"', 'children:"编辑模型"'],
        ['label:"Run"', 'label:"运行"'],
        // === New: Start / Ask / Changes / Expand / Thought / Status ===
        ['children:["Start a New Conversation"', 'children:["开始新对话"'],
        ['inputPlaceholder:i="Ask anything, @ to mention, / for workflows"', 'inputPlaceholder:i="输入任何内容，@ 用于提及，/ 用于调用工作流"'],
        ['placeholder??"Ask anything - use \'@\' to mention code blocks"', 'placeholder??"输入任何内容 - 用 \'@\' 用于提及代码块"'],
        ['`Ask anything (${r?"⌘L":"Ctrl+L"}), @ to mention, / for workflows`', '`输入任何内容 (${r?"⌘L":"Ctrl+L"})，@ 用于提及，/ 用于调用工作流`'],
        ['`Changes Overview (${d})`', '`更改概览 (${d})`'],
        ['`Terminal (${d})`', '`终端 (${d})`'],
        ['`Artifacts (${d})`', '`产物 (${d})`'],
        ['text:l?"Collapse all":"Expand all"', 'text:l?"全部折叠":"全部展开"'],
        ['children:"Expand All"', 'children:"全部展开"'],
        ['children:"Collapse All"', 'children:"全部折叠"'],
        ['`Thinking for ${TTe(t)}`', '`思考中 ${TTe(t)}`'],
        ['`Thought for ${', '`思考了 ${'],
        ['children:"Thought Process"', 'children:"思考过程"'],
        ['"Auto-proceeded by the agent under your review policy."', '"已由 Agent 根据您的审查策略自动继续。"'],
        ['"Manually proceeded under your review policy."', '"已根据您的审查策略手动继续。"'],
        ['["Generating","Working","Loading"]', '["生成中","工作中","加载中"]'],
        ['children:"Artifacts"', 'children:"产物"'],
        ['children:"Model"', 'children:"模型"'],
        ['children:["Proceed"', 'children:["继续"'],
        ['children:"Manually set Agent ID"', 'children:"手动设置 Agent ID"'],
        ['placeholder:"Search metrics..."', 'placeholder:"搜索指标..."'],
        ['placeholder:"Find"', 'placeholder:"查找"'],
        // === Batch 2: Artifacts / Audio / AI disclaimer / Report ===
        ['children:"Artifacts are files the agent creates during a conversation to help perform longer running tasks and allow the user to provide high-level feedback. Click to open in editor."',
            'children:"产物是 Agent 在对话中创建的文件，用于帮助执行较长时间运行的任务并允许用户提供高级反馈。点击在编辑器中打开。"'],
        ['children:"Artifact Name"', 'children:"产物名称"'],
        ['children:"Last Updated"', 'children:"最后更新"'],
        ['`Artifacts (${n.length} Files for Conversation)`', '`产物 (${n.length} 个对话文件)`'],
        ['children:"AI may make mistakes. Double-check all generated code."', 'children:"AI 可能会犯错。请仔细检查所有生成的代码。"'],
        ['children:"Send"', 'children:"发送"'],
        ['"Audio is not supported for this model"', '"该模型不支持音频"'],
        ['"No microphone detected"', '"未检测到麦克风"'],
        ['children:"1. Report Issue"', 'children:"1. 报告问题"'],
        ['children:"Get Logs"', 'children:"获取日志"'],
        ['"If you are having difficulty using "', '"如果你在使用 "'],
        ['", please report the issue using our feedback form."', '" 时遇到困难，请使用我们的反馈表单报告问题。"'],
        // === Batch 3: Comment / Reject / Audio tooltip ===
        ['children:"Comment"', 'children:"评论"'],
        ['children:"Reject"', 'children:"拒绝"'],
        // === Batch 4: results 个结果 ===
        ['," result",1===a?"":"s"', '," 个结果"'],
        ['," result",1===e.resources.length?"":"s"', '," 个结果"'],
        ['," result",1===a.length?"":"s"," "', '," 个结果 "'],
        ['," result",1===h?"":"s"', '," 个结果"'],
        // ═══════════════════════════════════════════════════════════════
        // 从参考项目 translations_chat.js 合并的翻译词条 (554 条)
        // ═══════════════════════════════════════════════════════════════
        ['". As always, you can use the thumbs up or thumbs down feedback mechanism to help improve our metrics."', '"\u3002\u60A8\u53EF\u4EE5\u4F7F\u7528\u70B9\u8D5E\u6216\u70B9\u8E29\u53CD\u9988\u673A\u5236\u6765\u5E2E\u52A9\u6539\u8FDB\u6211\u4EEC\u7684\u6307\u6807\u3002"'],  // 。您可以使用点赞或点踩反馈机制来帮助改进我们的指标。
        ['"(Dev-only) Select a mixin to use in the agent. This will tailor Cascade for different task types by changing things like the system prompt, tools available, etc."', '"(\u4EC5\u5F00\u53D1) \u9009\u62E9\u8981\u5728\u4EE3\u7406\u4E2D\u4F7F\u7528\u7684\u6DF7\u5165\u3002\u8FD9\u5C06\u901A\u8FC7\u66F4\u6539\u7CFB\u7EDF\u63D0\u793A\u3001\u53EF\u7528\u5DE5\u5177\u7B49\u6765\u4E3A\u4E0D\u540C\u7684\u4EFB\u52A1\u7C7B\u578B\u5B9A\u5236 Cascade\u3002"'],  // (仅开发) 选择要在代理中使用的混入。这将通过更改系统提示、可用工具等来为不同的任务类型定制 Cascade。
        ['"[Today at] LT"', '"[\u4ECA\u5929] LT"'],  // [今天] LT
        ['"[Tomorrow at] LT"', '"[\u660E\u5929] LT"'],  // [明天] LT
        ['"[Yesterday at] LT"', '"[\u6628\u5929] LT"'],  // [昨天] LT
        ['"%d days"', '"%d \u5929"'],  // %d 天
        ['"%d hours"', '"%d \u5C0F\u65F6"'],  // %d 小时
        ['"%d minutes"', '"%d \u5206\u949F"'],  // %d 分钟
        ['"%d months"', '"%d \u4E2A\u6708"'],  // %d 个月
        ['"%d seconds"', '"%d \u79D2"'],  // %d 秒
        ['"%d weeks"', '"%d \u5468"'],  // %d 周
        ['"%d years"', '"%d \u5E74"'],  // %d 年
        ['"%s ago"', '"%s\u524D"'],  // %s前
        ['"2. Resetting Agent"', '"2. \u91CD\u7F6E\u4EE3\u7406"'],  // 2. 重置代理
        ['"A chunk is a section of the page. Long pages are chunked so that only the sections that are relevant to your query are read."', '"\u5757\u662F\u9875\u9762\u7684\u4E00\u4E2A\u90E8\u5206\u3002\u957F\u9875\u9762\u4F1A\u88AB\u5206\u5757\uFF0C\u4EE5\u4FBF\u53EA\u8BFB\u53D6\u4E0E\u60A8\u7684\u67E5\u8BE2\u76F8\u5173\u7684\u90E8\u5206\u3002"'],  // 块是页面的一个部分。长页面会被分块，以便只读取与您的查询相关的部分。
        ['"a day"', '"\u4E00\u5929"'],  // 一天
        ['"a few seconds"', '"\u51E0\u79D2"'],  // 几秒
        ['"a minute"', '"\u4E00\u5206\u949F"'],  // 一分钟
        ['"a month"', '"\u4E00\u4E2A\u6708"'],  // 一个月
        ['"a week"', '"\u4E00\u5468"'],  // 一周
        ['"a year"', '"\u4E00\u5E74"'],  // 一年
        ['"Aborted"', '"\u5DF2\u4E2D\u6B62"'],  // 已中止
        ['"Absolute uri to pbtxt config"', '"pbtxt \u914D\u7F6E\u7684\u7EDD\u5BF9 URI"'],  // pbtxt 配置的绝对 URI
        ['"Accepted"', '"\u5DF2\u63A5\u53D7"'],  // 已接受
        ['"Accessibility"', '"\u8F85\u52A9\u529F\u80FD"'],  // 辅助功能
        ['"Active Browser page"', '"\u6D3B\u52A8\u6D4F\u89C8\u5668\u9875\u9762"'],  // 活动浏览器页面
        ['"Active Browser pages"', '"\u6D3B\u52A8\u6D4F\u89C8\u5668\u9875\u9762"'],  // 活动浏览器页面
        ['"Active"', '"\u6D3B\u52A8"'],  // 活动
        ['"Activities cannot be viewed"', '"\u65E0\u6CD5\u67E5\u770B\u6D3B\u52A8"'],  // 无法查看活动
        ['"Activity"', '"\u6D3B\u52A8"'],  // 活动
        ['"Agent Action DOM Diffs:"', '"\u4EE3\u7406\u64CD\u4F5C DOM \u5DEE\u5F02:"'],  // 代理操作 DOM 差异:
        ['"Agent can click and drag in the browser."', '"\u4EE3\u7406\u53EF\u4EE5\u5728\u6D4F\u89C8\u5668\u4E2D\u70B9\u51FB\u548C\u62D6\u52A8\u3002"'],  // 代理可以在浏览器中点击和拖动。
        ['"Agent can click on specific elements in the browser."', '"\u4EE3\u7406\u53EF\u4EE5\u70B9\u51FB\u6D4F\u89C8\u5668\u4E2D\u7684\u7279\u5B9A\u5143\u7D20\u3002"'],  // 代理可以点击浏览器中的特定元素。
        ['"Agent can resize browser windows to different dimensions or window states."', '"\u4EE3\u7406\u53EF\u4EE5\u5C06\u6D4F\u89C8\u5668\u7A97\u53E3\u8C03\u6574\u4E3A\u4E0D\u540C\u7684\u5C3A\u5BF8\u6216\u7A97\u53E3\u72B6\u6001\u3002"'],  // 代理可以将浏览器窗口调整为不同的尺寸或窗口状态。
        ['"Agent execution terminated due to model provider overload. Please try again later."', '"\u4EE3\u7406\u6267\u884C\u56E0\u6A21\u578B\u63D0\u4F9B\u5546\u8FC7\u8F7D\u800C\u7EC8\u6B62\u3002\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"'],  // 代理执行因模型提供商过载而终止。请稍后重试。
        ['"Agent terminated due to error"', '"\u4EE3\u7406\u56E0\u9519\u8BEF\u800C\u7EC8\u6B62"'],  // 代理因错误而终止
        ['"Allow once"', '"\u5141\u8BB8\u4E00\u6B21"'],  // 允许一次
        ['"Already exists"', '"\u5DF2\u5B58\u5728"'],  // 已存在
        ['"Alt text:"', '"\u66FF\u4EE3\u6587\u672C:"'],  // 替代文本:
        ['"Always allow"', '"\u59CB\u7EC8\u5141\u8BB8"'],  // 始终允许
        ['"Always ask for permission"', '"\u59CB\u7EC8\u8BE2\u95EE\u6743\u9650"'],  // 始终询问权限
        ['"Always Auto-Run"', '"\u59CB\u7EC8\u81EA\u52A8\u8FD0\u884C"'],  // 始终自动运行
        ['"Always run terminal commands"', '"\u59CB\u7EC8\u8FD0\u884C\u7EC8\u7AEF\u547D\u4EE4"'],  // 始终运行终端命令
        ['"An error ID that helps the team investigate the error."', '"\u5E2E\u52A9\u56E2\u961F\u8C03\u67E5\u9519\u8BEF\u7684\u9519\u8BEF ID\u3002"'],  // 帮助团队调查错误的错误 ID。
        ['"an hour"', '"\u4E00\u5C0F\u65F6"'],  // 一小时
        ['"An unknown error occurred"', '"\u53D1\u751F\u672A\u77E5\u9519\u8BEF"'],  // 发生未知错误
        ['"Approved"', '"\u5DF2\u6279\u51C6"'],  // 已批准
        ['"Argument must be a Buffer"', '"\u53C2\u6570\u5FC5\u987B\u662F Buffer"'],  // 参数必须是 Buffer
        ['"Arguments Schema:"', '"\u53C2\u6570\u6A21\u5F0F:"'],  // 参数模式:
        ['"Artifact Comments"', '"\u5DE5\u4EF6\u8BC4\u8BBA"'],  // 工件评论
        ['"Artifact image"', '"\u5DE5\u4EF6\u56FE\u50CF"'],  // 工件图像
        ['"Artifacts are created when the agent performs more complex, longer running tasks while in Planning mode."', '"\u5DE5\u4EF6\u662F\u4EE3\u7406\u5728\u89C4\u5212\u6A21\u5F0F\u4E0B\u6267\u884C\u66F4\u590D\u6742\u3001\u8017\u65F6\u66F4\u957F\u7684\u4EFB\u52A1\u65F6\u521B\u5EFA\u7684\u3002"'],  // 工件是代理在规划模式下执行更复杂、耗时更长的任务时创建的。
        ['"At mention"', '"@ \u5F15\u7528"'],  // @ 引用
        ['"Attach the trajectory ID to the feedback form"', '"\u5C06\u8F68\u8FF9 ID \u9644\u52A0\u5230\u53CD\u9988\u8868\u5355"'],  // 将轨迹 ID 附加到反馈表单
        ['"Attempt to write outside buffer bounds"', '"\u5C1D\u8BD5\u5199\u5165\u7F13\u51B2\u533A\u8FB9\u754C\u5916"'],  // 尝试写入缓冲区边界外
        ['"Attribute"', '"\u5C5E\u6027"'],  // 属性
        ['"Authorization"', '"\u6388\u6743"'],  // 授权
        ['"Auto-Run On Model Decision"', '"\u6839\u636E\u6A21\u578B\u51B3\u7B56\u81EA\u52A8\u8FD0\u884C"'],  // 根据模型决策自动运行
        ['"Back to content"', '"\u8FD4\u56DE\u5185\u5BB9"'],  // 返回内容
        ['"background terminal command"', '"\u540E\u53F0\u7EC8\u7AEF\u547D\u4EE4"'],  // 后台终端命令
        ['"Backwards"', '"\u5411\u540E"'],  // 向后
        ['"Baseline"', '"\u57FA\u7EBF"'],  // 基线
        ['"BETA"', '"\u6D4B\u8BD5\u7248"'],  // 测试版
        ['"Billed at API pricing"', '"\u6309 API \u5B9A\u4EF7\u8BA1\u8D39"'],  // 按 API 定价计费
        ['"Browser Code"', '"\u6D4F\u89C8\u5668\u4EE3\u7801"'],  // 浏览器代码
        ['"Browser Content"', '"\u6D4F\u89C8\u5668\u5185\u5BB9"'],  // 浏览器内容
        ['"Browser Mode:"', '"\u6D4F\u89C8\u5668\u6A21\u5F0F:"'],  // 浏览器模式:
        ['"Browser Text"', '"\u6D4F\u89C8\u5668\u6587\u672C"'],  // 浏览器文本
        ['"Browser Tool Set Mode:"', '"\u6D4F\u89C8\u5668\u5DE5\u5177\u96C6\u6A21\u5F0F:"'],  // 浏览器工具集模式:
        ['"Browser Tools:"', '"\u6D4F\u89C8\u5668\u5DE5\u5177:"'],  // 浏览器工具:
        ['"Bytes"', '"\u5B57\u8282"'],  // 字节
        ['"Canceled creation of"', '"\u5DF2\u53D6\u6D88\u521B\u5EFA"'],  // 已取消创建
        ['"Canceled deletion of"', '"\u5DF2\u53D6\u6D88\u5220\u9664"'],  // 已取消删除
        ['"Canceled edit to"', '"\u5DF2\u53D6\u6D88\u7F16\u8F91"'],  // 已取消编辑
        ['"Canceled extension code"', '"\u5DF2\u53D6\u6D88\u6269\u5C55\u4EE3\u7801"'],  // 已取消扩展代码
        ['"Canceled"', '"\u5DF2\u53D6\u6D88"'],  // 已取消
        ['"Cannot revert messages with artifact comments"', '"\u65E0\u6CD5\u64A4\u9500\u5305\u542B\u5DE5\u4EF6\u8BC4\u8BBA\u7684\u6D88\u606F"'],  // 无法撤销包含工件评论的消息
        ['"Cannot revert messages with file comments"', '"\u65E0\u6CD5\u64A4\u9500\u5305\u542B\u6587\u4EF6\u8BC4\u8BBA\u7684\u6D88\u606F"'],  // 无法撤销包含文件评论的消息
        ['"Cannot revert messages with file diff comments"', '"\u65E0\u6CD5\u64A4\u9500\u5305\u542B\u6587\u4EF6\u5DEE\u5F02\u8BC4\u8BBA\u7684\u6D88\u606F"'],  // 无法撤销包含文件差异评论的消息
        ['"Cannot revert this message"', '"\u65E0\u6CD5\u64A4\u9500\u6B64\u6D88\u606F"'],  // 无法撤销此消息
        ['"Caps Lock"', '"\u5927\u5199\u9501\u5B9A"'],  // 大写锁定
        ['"Chat Model Metadata"', '"\u804A\u5929\u6A21\u578B\u5143\u6570\u636E"'],  // 聊天模型元数据
        ['"Checked command status"', '"\u5DF2\u68C0\u67E5\u547D\u4EE4\u72B6\u6001"'],  // 已检查命令状态
        ['"Checking command status"', '"\u6B63\u5728\u68C0\u67E5\u547D\u4EE4\u72B6\u6001"'],  // 正在检查命令状态
        ['"Clear NUX state"', '"\u6E05\u9664\u65B0\u7528\u6237\u72B6\u6001"'],  // 清除新用户状态
        ['"Cleared Count"', '"\u5DF2\u6E05\u9664\u8BA1\u6570"'],  // 已清除计数
        ['"Click Feedback:"', '"\u70B9\u51FB\u53CD\u9988:"'],  // 点击反馈:
        ['"Clicked in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u70B9\u51FB"'],  // 在浏览器中点击
        ['"Clicked"', '"\u5DF2\u70B9\u51FB"'],  // 已点击
        ['"Clicking in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u70B9\u51FB"'],  // 正在浏览器中点击
        ['"Clicking"', '"\u70B9\u51FB\u4E2D"'],  // 点击中
        ['"Closed"', '"\u5DF2\u5173\u95ED"'],  // 已关闭
        ['"Closing"', '"\u5173\u95ED\u4E2D"'],  // 关闭中
        ['"Code Context Item Subranges"', '"\u4EE3\u7801\u4E0A\u4E0B\u6587\u5B50\u8303\u56F4"'],  // 代码上下文子范围
        ['"Code Context Items"', '"\u4EE3\u7801\u4E0A\u4E0B\u6587\u9879"'],  // 代码上下文项
        ['"Files"', '"\u6587\u4EF6"'],  // 文件
        ['"MCP servers"', '"MCP \u670D\u52A1\u5668"'],  // MCP 服务器
        ['"Conversations"', '"\u804A\u5929\u5217\u8868"'],  // 对话列表
        ['"Rules"', '"规则"'],  // 规则
        ['"Terminal"', '"终端命令"'],  // 终端
        ['"Code Snippet"', '"\u4EE3\u7801\u7247\u6BB5"'],  // 代码片段
        ['"Combobox"', '"\u7EC4\u5408\u6846"'],  // 组合框
        ['"Configure Auto-Run"', '"\u914D\u7F6E\u81EA\u52A8\u8FD0\u884C"'],  // 配置自动运行
        ['"Confirm Browser Interaction"', '"\u786E\u8BA4\u6D4F\u89C8\u5668\u4EA4\u4E92"'],  // 确认浏览器交互
        ['"Confirming this undo action will make the following changes:"', '"\u786E\u8BA4\u6B64\u64A4\u9500\u64CD\u4F5C\u5C06\u8FDB\u884C\u4EE5\u4E0B\u66F4\u6539:"'],  // 确认此撤销操作将进行以下更改:
        ['"Console Logs"', '"\u63A7\u5236\u53F0\u65E5\u5FD7"'],  // 控制台日志
        ['"Conversational"', '"\u5BF9\u8BDD\u5F0F"'],  // 对话式
        ['"Coordinated Universal Time"', '"\u534F\u8C03\u4E16\u754C\u65F6"'],  // 协调世界时
        ['"Copied"', '"\u5DF2\u590D\u5236"'],  // 已复制
        ['"Copy Link"', '"\u590D\u5236\u94FE\u63A5"'],  // 复制链接
        ['"Copy to clipboard"', '"\u590D\u5236\u5230\u526A\u8D34\u677F"'],  // 复制到剪贴板
        ['"Cost"', '"\u6210\u672C"'],  // 成本
        ['"Ran command"', '"\u884C\u884C\u547D\u4EE4"'],  // 运行命令
        ['"Created At"', '"\u521B\u5EFA\u65F6\u95F4"'],  // 创建时间
        ['"Created:"', '"\u521B\u5EFA\u4E8E:"'],  // 创建于:
        ['"Creating"', '"\u521B\u5EFA\u4E2D"'],  // 创建中
        ['"Custom Config"', '"\u81EA\u5B9A\u4E49\u914D\u7F6E"'],  // 自定义配置
        ['"Custom models are only supported on Cloudtop / Linux machines."', '"\u81EA\u5B9A\u4E49\u6A21\u578B\u4EC5\u5728 Cloudtop / Linux \u673A\u5668\u4E0A\u652F\u6301\u3002"'],  // 自定义模型仅在 Cloudtop / Linux 机器上支持。
        ['"Custom Reminder:"', '"\u81EA\u5B9A\u4E49\u63D0\u9192:"'],  // 自定义提醒:
        ['"Custom URI"', '"\u81EA\u5B9A\u4E49 URI"'],  // 自定义 URI
        ['"Data loss"', '"\u6570\u636E\u4E22\u5931"'],  // 数据丢失
        ['"Dead"', '"\u5DF2\u7EC8\u6B62"'],  // 已终止
        ['"Deadline exceeded"', '"\u8D85\u65F6"'],  // 超时
        ['"Debug Mode"', '"\u8C03\u8BD5\u6A21\u5F0F"'],  // 调试模式
        ['"Debug Sidebar"', '"\u8C03\u8BD5\u4FA7\u8FB9\u680F"'],  // 调试侧边栏
        ['"Default Config"', '"\u9ED8\u8BA4\u914D\u7F6E"'],  // 默认配置
        ['"Deleted"', '"\u5DF2\u5220\u9664"'],  // 已删除
        ['"Deleting"', '"\u5220\u9664\u4E2D"'],  // 删除中
        ['"Description:"', '"\u63CF\u8FF0:"'],  // 描述:
        ['"Description"', '"\u63CF\u8FF0"'],  // 描述
        ['"Developer Menu"', '"\u5F00\u53D1\u8005\u83DC\u5355"'],  // 开发者菜单
        ['"Dialog"', '"\u5BF9\u8BDD\u6846"'],  // 对话框
        ['"Diameter"', '"\u76F4\u5F84"'],  // 直径
        ['"Directories"', '"\u76EE\u5F55"'],  // 目录
        ['"Disabled in Secure Mode"', '"\u5728\u5B89\u5168\u6A21\u5F0F\u4E0B\u5DF2\u7981\u7528"'],  // 在安全模式下已禁用
        ['"Disclosure"', '"\u62AB\u9732"'],  // 披露
        ['"Dismiss suggested actions"', '"\u5173\u95ED\u5EFA\u8BAE\u64CD\u4F5C"'],  // 关闭建议操作
        ['"Document Answers"', '"\u6587\u6863\u7B54\u6848"'],  // 文档答案
        ['"DOM Element"', '"DOM \u5143\u7D20"'],  // DOM 元素
        ['"Dragged in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u62D6\u62FD"'],  // 在浏览器中拖拽
        ['"Dragging in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u62D6\u62FD"'],  // 正在浏览器中拖拽
        ['"Dynamic Wait Tool:"', '"\u52A8\u6001\u7B49\u5F85\u5DE5\u5177:"'],  // 动态等待工具:
        ['"Editing"', '"\u7F16\u8F91\u4E2D"'],  // 编辑中
        ['"Electron Mode"', '"Electron \u6A21\u5F0F"'],  // Electron 模式
        ['"Empty"', '"\u7A7A"'],  // 空
        ['"Enabled"', '"\u5DF2\u542F\u7528"'],  // 已启用
        ['"End of comment missing"', '"\u7F3A\u5C11\u6CE8\u91CA\u7ED3\u5C3E"'],  // 缺少注释结尾
        ['"Enlarged image"', '"\u653E\u5927\u7684\u56FE\u50CF"'],  // 放大的图像
        ['"Enter Agent ID"', '"\u8F93\u5165\u4EE3\u7406 ID"'],  // 输入代理 ID
        ['"Enter custom reminder text for the planner..."', '"\u8F93\u5165\u89C4\u5212\u5668\u7684\u81EA\u5B9A\u4E49\u63D0\u9192\u6587\u672C..."'],  // 输入规划器的自定义提醒文本...
        ['"Ephemeral Options:"', '"\u4E34\u65F6\u9009\u9879:"'],  // 临时选项:
        ['"Equal"', '"\u76F8\u7B49"'],  // 相等
        ['"Error checking microphone availability:"', '"\u68C0\u67E5\u9EA6\u514B\u98CE\u53EF\u7528\u6027\u65F6\u51FA\u9519:"'],  // 检查麦克风可用性时出错:
        ['"Error Details:"', '"\u9519\u8BEF\u8BE6\u60C5:"'],  // 错误详情:
        ['"Error Details"', '"\u9519\u8BEF\u8BE6\u60C5"'],  // 错误详情
        ['"Error during tool execution"', '"\u5DE5\u5177\u6267\u884C\u671F\u95F4\u51FA\u9519"'],  // 工具执行期间出错
        ['"Error editing file"', '"\u7F16\u8F91\u6587\u4EF6\u65F6\u51FA\u9519"'],  // 编辑文件时出错
        ['"Error in event listener:"', '"\u4E8B\u4EF6\u76D1\u542C\u5668\u51FA\u9519:"'],  // 事件监听器出错:
        ['"Error occurred"', '"\u53D1\u751F\u9519\u8BEF"'],  // 发生错误
        ['"Error opening workspace quick pick:"', '"\u6253\u5F00\u5DE5\u4F5C\u533A\u5FEB\u901F\u9009\u62E9\u65F6\u51FA\u9519:"'],  // 打开工作区快速选择时出错:
        ['"Error parsing JSON:"', '"\u89E3\u6790 JSON \u65F6\u51FA\u9519:"'],  // 解析 JSON 时出错:
        ['"Error rendering CodeBlock"', '"\u6E32\u67D3\u4EE3\u7801\u5757\u65F6\u51FA\u9519"'],  // 渲染代码块时出错
        ['"Error rendering Markdown"', '"\u6E32\u67D3 Markdown \u65F6\u51FA\u9519"'],  // 渲染 Markdown 时出错
        ['"Error rendering playback"', '"\u6E32\u67D3\u56DE\u653E\u65F6\u51FA\u9519"'],  // 渲染回放时出错
        ['"Error viewing file"', '"\u67E5\u770B\u6587\u4EF6\u65F6\u51FA\u9519"'],  // 查看文件时出错
        ['"Error while analyzing directory"', '"\u5206\u6790\u76EE\u5F55\u65F6\u51FA\u9519"'],  // 分析目录时出错
        ['"Error while editing"', '"\u7F16\u8F91\u65F6\u51FA\u9519"'],  // 编辑时出错
        ['"Error while running command"', '"\u8FD0\u884C\u547D\u4EE4\u65F6\u51FA\u9519"'],  // 运行命令时出错
        ['"Error while running MCP tool"', '"\u8FD0\u884C MCP \u5DE5\u5177\u65F6\u51FA\u9519"'],  // 运行 MCP 工具时出错
        ['"Error while searching filesystem"', '"\u641C\u7D22\u6587\u4EF6\u7CFB\u7EDF\u65F6\u51FA\u9519"'],  // 搜索文件系统时出错
        ['"Error while searching the web"', '"\u641C\u7D22\u7F51\u9875\u65F6\u51FA\u9519"'],  // 搜索网页时出错
        ['"Error while searching"', '"\u641C\u7D22\u65F6\u51FA\u9519"'],  // 搜索时出错
        ['"Error while semantic searching"', '"\u8BED\u4E49\u641C\u7D22\u65F6\u51FA\u9519"'],  // 语义搜索时出错
        ['"Error while viewing"', '"\u67E5\u770B\u65F6\u51FA\u9519"'],  // 查看时出错
        ['"Execute Javascript policy"', '"\u6267\u884C JavaScript \u7B56\u7565"'],  // 执行 JavaScript 策略
        ['"Expected a function"', '"\u671F\u671B\u4E00\u4E2A\u51FD\u6570"'],  // 期望一个函数
        ['"Expected a string"', '"\u671F\u671B\u4E00\u4E2A\u5B57\u7B26\u4E32"'],  // 期望一个字符串
        ['"Expected array or object as schema"', '"\u671F\u671B\u6570\u7EC4\u6216\u5BF9\u8C61\u4F5C\u4E3A\u67B6\u6784"'],  // 期望数组或对象作为架构
        ['"Expected character"', '"\u671F\u671B\u5B57\u7B26"'],  // 期望字符
        ['"Expected substring"', '"\u671F\u671B\u5B50\u5B57\u7B26\u4E32"'],  // 期望子字符串
        ['"Extension client not available"', '"\u6269\u5C55\u5BA2\u6237\u7AEF\u4E0D\u53EF\u7528"'],  // 扩展客户端不可用
        ['"Extracted DOM elements"', '"\u5DF2\u63D0\u53D6 DOM \u5143\u7D20"'],  // 已提取 DOM 元素
        ['"Extracting DOM elements"', '"\u6B63\u5728\u63D0\u53D6 DOM \u5143\u7D20"'],  // 正在提取 DOM 元素
        ['"Failed precondition"', '"\u524D\u7F6E\u6761\u4EF6\u5931\u8D25"'],  // 前置条件失败
        ['"Failed to add URL to allowlist: addToBrowserAllowlist is undefined"', '"\u6DFB\u52A0 URL \u5230\u767D\u540D\u5355\u5931\u8D25: addToBrowserAllowlist \u672A\u5B9A\u4E49"'],  // 添加 URL 到白名单失败: addToBrowserAllowlist 未定义
        ['"Failed to add URL to allowlist:"', '"\u6DFB\u52A0 URL \u5230\u767D\u540D\u5355\u5931\u8D25:"'],  // 添加 URL 到白名单失败:
        ['"Failed to copy text using Clipboard API: "', '"\u4F7F\u7528\u526A\u8D34\u677F API \u590D\u5236\u6587\u672C\u5931\u8D25: "'],  // 使用剪贴板 API 复制文本失败: 
        ['"Failed to copy text using document.execCommand: "', '"\u4F7F\u7528 document.execCommand \u590D\u5236\u6587\u672C\u5931\u8D25: "'],  // 使用 document.execCommand 复制文本失败: 
        ['"Failed to create workflow:"', '"\u521B\u5EFA\u5DE5\u4F5C\u6D41\u5931\u8D25:"'],  // 创建工作流失败:
        ['"Failed to delete queued message:"', '"\u5220\u9664\u6392\u961F\u6D88\u606F\u5931\u8D25:"'],  // 删除排队消息失败:
        ['"Failed to enable server, click to see details."', '"\u542F\u7528\u670D\u52A1\u5668\u5931\u8D25\uFF0C\u70B9\u51FB\u67E5\u770B\u8BE6\u60C5\u3002"'],  // 启用服务器失败，点击查看详情。
        ['"Failed to extract waveform:"', '"\u63D0\u53D6\u6CE2\u5F62\u5931\u8D25:"'],  // 提取波形失败:
        ['"Failed to fetch custom agent configs:"', '"\u83B7\u53D6\u81EA\u5B9A\u4E49\u4EE3\u7406\u914D\u7F6E\u5931\u8D25:"'],  // 获取自定义代理配置失败:
        ['"failed to fetch HEAD for "', '"\u83B7\u53D6 HEAD \u5931\u8D25: "'],  // 获取 HEAD 失败: 
        ['"Failed to find the root element"', '"\u672A\u80FD\u627E\u5230\u6839\u5143\u7D20"'],  // 未能找到根元素
        ['"Failed to get static experiments"', '"\u83B7\u53D6\u9759\u6001\u5B9E\u9A8C\u5931\u8D25"'],  // 获取静态实验失败
        ['"Failed to open plugin page: "', '"\u6253\u5F00\u63D2\u4EF6\u9875\u9762\u5931\u8D25: "'],  // 打开插件页面失败: 
        ['"Failed to parse ContextScopeItem from mention node:"', '"\u4ECE\u63D0\u53CA\u8282\u70B9\u89E3\u6790 ContextScopeItem \u5931\u8D25:"'],  // 从提及节点解析 ContextScopeItem 失败:
        ['"Failed to parse quota metadata"', '"\u89E3\u6790\u914D\u989D\u5143\u6570\u636E\u5931\u8D25"'],  // 解析配额元数据失败
        ['"Failed to parse quota reset timestamp"', '"\u89E3\u6790\u914D\u989D\u91CD\u7F6E\u65F6\u95F4\u6233\u5931\u8D25"'],  // 解析配额重置时间戳失败
        ['"Failed to parse tool JSON schema:"', '"\u89E3\u6790\u5DE5\u5177 JSON \u6A21\u5F0F\u5931\u8D25:"'],  // 解析工具 JSON 模式失败:
        ['"Failed to parse toolCallArgumentsJson:"', '"\u89E3\u6790 toolCallArgumentsJson \u5931\u8D25:"'],  // 解析 toolCallArgumentsJson 失败:
        ['"Failed to refresh user memories:"', '"\u5237\u65B0\u7528\u6237\u8BB0\u5FC6\u5931\u8D25:"'],  // 刷新用户记忆失败:
        ['"Failed to start screen recording"', '"\u542F\u52A8\u5C4F\u5E55\u5F55\u5236\u5931\u8D25"'],  // 启动屏幕录制失败
        ['"File Comments"', '"\u6587\u4EF6\u8BC4\u8BBA"'],  // 文件评论
        ['"File Diff Comments"', '"\u6587\u4EF6\u5DEE\u5F02\u8BC4\u8BBA"'],  // 文件差异评论
        ['"Files to edit:"', '"\u8981\u7F16\u8F91\u7684\u6587\u4EF6:"'],  // 要编辑的文件:
        ['"First argument must be a string"', '"\u7B2C\u4E00\u4E2A\u53C2\u6570\u5FC5\u987B\u662F\u5B57\u7B26\u4E32"'],  // 第一个参数必须是字符串
        ['"Focus"', '"\u805A\u7126"'],  // 聚焦
        ['"Focused"', '"\u5DF2\u805A\u7126"'],  // 已聚焦
        ['"Folder"', '"\u6587\u4EF6\u5939"'],  // 文件夹
        ['"Folders"', '"\u6587\u4EF6\u5939"'],  // 文件夹
        ['"Footnotes"', '"\u811A\u6CE8"'],  // 脚注
        ['"Forward"', '"\u524D\u8FDB"'],  // 前进
        ['"Forwards"', '"\u5411\u524D"'],  // 向前
        ['"Found references to"', '"\u627E\u5230\u5F15\u7528"'],  // 找到引用
        ['"Fragment"', '"\u7247\u6BB5"'],  // 片段
        ['"Full Metadata"', '"\u5B8C\u6574\u5143\u6570\u636E"'],  // 完整元数据
        ['"Gemini Computer Use"', '"Gemini \u8BA1\u7B97\u673A\u4F7F\u7528"'],  // Gemini 计算机使用
        ['"Generated image preview"', '"\u751F\u6210\u7684\u56FE\u50CF\u9884\u89C8"'],  // 生成的图像预览
        ['"Generating extension code"', '"\u6B63\u5728\u751F\u6210\u6269\u5C55\u4EE3\u7801"'],  // 正在生成扩展代码
        ['"Goal"', '"\u76EE\u6807"'],  // 目标
        ['"Greater"', '"\u5927\u4E8E"'],  // 大于
        ['"Hashing function not available"', '"\u54C8\u5E0C\u51FD\u6570\u4E0D\u53EF\u7528"'],  // 哈希函数不可用
        ['"Heading"', '"\u6807\u9898"'],  // 标题
        ['"Hidden"', '"\u5DF2\u9690\u85CF"'],  // 已隐藏
        ['"Hide 0s"', '"\u9690\u85CF 0 \u79D2"'],  // 隐藏 0 秒
        ['"Hours"', '"\u5C0F\u65F6"'],  // 小时
        ['"I did"', '"\u5DF2\u5B8C\u6210"'],  // 已完成
        ['"If you believe this is a bug, please"', '"\u5982\u679C\u60A8\u8BA4\u4E3A\u8FD9\u662F\u4E00\u4E2A bug\uFF0C\u8BF7"'],  // 如果您认为这是一个 bug，请
        ['"Ignore warning and attempt to send messages anyway regardless of network connection status. As a result, messages may get dropped."', '"\u5FFD\u7565\u8B66\u544A\u5E76\u5C1D\u8BD5\u53D1\u9001\u6D88\u606F\uFF0C\u65E0\u8BBA\u7F51\u7EDC\u8FDE\u63A5\u72B6\u6001\u5982\u4F55\u3002\u56E0\u6B64\uFF0C\u6D88\u606F\u53EF\u80FD\u4F1A\u4E22\u5931\u3002"'],  // 忽略警告并尝试发送消息，无论网络连接状态如何。因此，消息可能会丢失。
        ['"Image Answers"', '"\u56FE\u50CF\u7B54\u6848"'],  // 图像答案
        ['"Image Diff Not Supported"', '"\u4E0D\u652F\u6301\u56FE\u50CF\u5DEE\u5F02"'],  // 不支持图像差异
        ['"Image rendering blocked (Secure Mode enabled)"', '"\u56FE\u50CF\u6E32\u67D3\u88AB\u963B\u6B62 (\u5B89\u5168\u6A21\u5F0F\u5DF2\u542F\u7528)"'],  // 图像渲染被阻止 (安全模式已启用)
        ['"Image URL:"', '"\u56FE\u50CF URL:"'],  // 图像 URL:
        ['"in %s"', '"%s\u540E"'],  // %s后
        ['"In progress"', '"\u8FDB\u884C\u4E2D"'],  // 进行中
        ['"Index out of range"', '"\u7D22\u5F15\u8D85\u51FA\u8303\u56F4"'],  // 索引超出范围
        ['"Initializing"', '"\u521D\u59CB\u5316\u4E2D"'],  // 初始化中
        ['"Input"', '"\u8F93\u5165"'],  // 输入
        ['"Insert in terminal"', '"\u63D2\u5165\u5230\u7EC8\u7AEF"'],  // 插入到终端
        ['"Inspected commit"', '"\u5DF2\u68C0\u67E5\u7684\u63D0\u4EA4"'],  // 已检查的提交
        ['"Internal"', '"\u5185\u90E8"'],  // 内部
        ['"Invalid argument"', '"\u65E0\u6548\u53C2\u6570"'],  // 无效参数
        ['"Invalid code point"', '"\u65E0\u6548\u7684\u4EE3\u7801\u70B9"'],  // 无效的代码点
        ['"Invalid date"', '"\u65E0\u6548\u65E5\u671F"'],  // 无效日期
        ['"Invalid metadata page"', '"\u65E0\u6548\u7684\u5143\u6570\u636E\u9875\u9762"'],  // 无效的元数据页面
        ['"Invalid time value"', '"\u65E0\u6548\u7684\u65F6\u95F4\u503C"'],  // 无效的时间值
        ['"Invariant Violation"', '"\u4E0D\u53D8\u91CF\u8FDD\u89C4"'],  // 不变量违规
        ['"JavaScript Result"', '"JavaScript \u7ED3\u679C"'],  // JavaScript 结果
        ['"Jumps to the location of the terminal session that ran this command."', '"\u8DF3\u8F6C\u5230\u8FD0\u884C\u6B64\u547D\u4EE4\u7684\u7EC8\u7AEF\u4F1A\u8BDD\u4F4D\u7F6E\u3002"'],  // 跳转到运行此命令的终端会话位置。
        ['"Language server client not available"', '"\u8BED\u8A00\u670D\u52A1\u5668\u5BA2\u6237\u7AEF\u4E0D\u53EF\u7528"'],  // 语言服务器客户端不可用
        ['"Legacy"', '"\u65E7\u7248"'],  // 旧版
        ['"Less"', '"\u5C0F\u4E8E"'],  // 小于
        ['"Line Ranges"', '"\u884C\u8303\u56F4"'],  // 行范围
        ['"List resources: "', '"\u5217\u51FA\u8D44\u6E90: "'],  // 列出资源: 
        ['"Listbox"', '"\u5217\u8868\u6846"'],  // 列表框
        ['"LLMs can generate incorrect responses that we cannot handle."', '"LLM \u53EF\u80FD\u751F\u6210\u6211\u4EEC\u65E0\u6CD5\u5904\u7406\u7684\u9519\u8BEF\u54CD\u5E94\u3002"'],  // LLM 可能生成我们无法处理的错误响应。
        ['"Malformed diff information"', '"\u5DEE\u5F02\u4FE1\u606F\u683C\u5F0F\u9519\u8BEF"'],  // 差异信息格式错误
        ['"Manually Captured"', '"\u624B\u52A8\u6355\u83B7"'],  // 手动捕获
        ['"Manually Rejected"', '"\u624B\u52A8\u62D2\u7EDD"'],  // 手动拒绝
        ['"Max Context Characters (optional):"', '"\u6700\u5927\u4E0A\u4E0B\u6587\u5B57\u7B26\u6570 (\u53EF\u9009):"'],  // 最大上下文字符数 (可选):
        ['"Max Tokens"', '"\u6700\u5927 Token \u6570"'],  // 最大 Token 数
        ['"MCP Tool: "', '"MCP \u5DE5\u5177: "'],  // MCP 工具: 
        ['"Metadata:"', '"\u5143\u6570\u636E:"'],  // 元数据:
        ['"Metadata"', '"\u5143\u6570\u636E"'],  // 元数据
        ['"Metric"', '"\u6307\u6807"'],  // 指标
        ['"Milliseconds"', '"\u6BEB\u79D2"'],  // 毫秒
        ['"Minutes"', '"\u5206\u949F"'],  // 分钟
        ['"Missing chat params context"', '"\u7F3A\u5C11\u804A\u5929\u53C2\u6570\u4E0A\u4E0B\u6587"'],  // 缺少聊天参数上下文
        ['"Mixins"', '"\u6DF7\u5165"'],  // 混入
        ['"Model Label"', '"\u6A21\u578B\u6807\u7B7E"'],  // 模型标签
        ['"Model URL"', '"\u6A21\u578B URL"'],  // 模型 URL
        ['"Month"', '"\u6708"'],  // 月
        ['"Move Mouse in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u79FB\u52A8\u9F20\u6807"'],  // 在浏览器中移动鼠标
        ['"Move"', '"\u79FB\u52A8"'],  // 移动
        ['"Moves this terminal session to the Terminal tab in your IDE. The agent will still be able to use it."', '"\u5C06\u6B64\u7EC8\u7AEF\u4F1A\u8BDD\u79FB\u52A8\u5230 IDE \u7684\u7EC8\u7AEF\u9009\u9879\u5361\u3002\u4EE3\u7406\u4ECD\u53EF\u4EE5\u4F7F\u7528\u5B83\u3002"'],  // 将此终端会话移动到 IDE 的终端选项卡。代理仍可以使用它。
        ['"Moving Mouse in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u79FB\u52A8\u9F20\u6807"'],  // 正在浏览器中移动鼠标
        ['"Never Auto-Run"', '"\u4ECE\u4E0D\u81EA\u52A8\u8FD0\u884C"'],  // 从不自动运行
        ['"No @-mention results"', '"\u65E0 @ \u5F15\u7528\u7ED3\u679C"'],  // 无 @ 引用结果
        ['"No chat model metadata available for this generator"', '"\u6B64\u751F\u6210\u5668\u65E0\u53EF\u7528\u7684\u804A\u5929\u6A21\u578B\u5143\u6570\u636E"'],  // 此生成器无可用的聊天模型元数据
        ['"No chat model metadata available in latest generator metadata"', '"\u6700\u65B0\u751F\u6210\u5668\u5143\u6570\u636E\u4E2D\u65E0\u53EF\u7528\u7684\u804A\u5929\u6A21\u578B\u5143\u6570\u636E"'],  // 最新生成器元数据中无可用的聊天模型元数据
        ['"No content available for this resource"', '"\u6B64\u8D44\u6E90\u65E0\u53EF\u7528\u5185\u5BB9"'],  // 此资源无可用内容
        ['"No credits used"', '"\u672A\u4F7F\u7528\u79EF\u5206"'],  // 未使用积分
        ['"No description"', '"\u65E0\u63CF\u8FF0"'],  // 无描述
        ['"No generator metadata available"', '"\u65E0\u53EF\u7528\u7684\u751F\u6210\u5668\u5143\u6570\u636E"'],  // 无可用的生成器元数据
        ['"No Javascript Result Output"', '"\u65E0 JavaScript \u7ED3\u679C\u8F93\u51FA"'],  // 无 JavaScript 结果输出
        ['"No message prompts available"', '"\u65E0\u53EF\u7528\u7684\u6D88\u606F\u63D0\u793A"'],  // 无可用的消息提示
        ['"No Model Selected"', '"\u672A\u9009\u62E9\u6A21\u578B"'],  // 未选择模型
        ['"No renderer found for step case"', '"\u672A\u627E\u5230\u6B65\u9AA4\u6E32\u67D3\u5668"'],  // 未找到步骤渲染器
        ['"No resources available"', '"\u65E0\u53EF\u7528\u8D44\u6E90"'],  // 无可用资源
        ['"No response from extension client"', '"\u6269\u5C55\u5BA2\u6237\u7AEF\u65E0\u54CD\u5E94"'],  // 扩展客户端无响应
        ['"No screenshot returned from captureScreenshot RPC"', '"captureScreenshot RPC \u672A\u8FD4\u56DE\u622A\u56FE"'],  // captureScreenshot RPC 未返回截图
        ['"No snapshot taken"', '"\u672A\u62CD\u6444\u5FEB\u7167"'],  // 未拍摄快照
        ['"No step index found for artifact code action step"', '"\u672A\u627E\u5230\u5DE5\u4EF6\u4EE3\u7801\u64CD\u4F5C\u6B65\u9AA4\u7684\u6B65\u9AA4\u7D22\u5F15"'],  // 未找到工件代码操作步骤的步骤索引
        ['"No step index found for code action step"', '"\u672A\u627E\u5230\u4EE3\u7801\u64CD\u4F5C\u6B65\u9AA4\u7684\u6B65\u9AA4\u7D22\u5F15"'],  // 未找到代码操作步骤的步骤索引
        ['"No trajectories available"', '"\u65E0\u53EF\u7528\u8F68\u8FF9"'],  // 无可用轨迹
        ['"No trajectory steps available"', '"\u65E0\u53EF\u7528\u8F68\u8FF9\u6B65\u9AA4"'],  // 无可用轨迹步骤
        ['"No trajectory"', '"\u65E0\u8F68\u8FF9"'],  // 无轨迹
        ['"No URL returned from server"', '"\u670D\u52A1\u5668\u672A\u8FD4\u56DE URL"'],  // 服务器未返回 URL
        ['"No versions available"', '"\u65E0\u53EF\u7528\u7248\u672C"'],  // 无可用版本
        ['"None"', '"\u65E0"'],  // 无
        ['"Not a redirect error"', '"\u4E0D\u662F\u91CD\u5B9A\u5411\u9519\u8BEF"'],  // 不是重定向错误
        ['"Not implemented"', '"\u672A\u5B9E\u73B0"'],  // 未实现
        ['"Nothing"', '"\u65E0"'],  // 无
        ['"Open extracted DOM tree in editor"', '"\u5728\u7F16\u8F91\u5668\u4E2D\u6253\u5F00\u63D0\u53D6\u7684 DOM \u6811"'],  // 在编辑器中打开提取的 DOM 树
        ['"Open in Terminal"', '"\u5728\u7EC8\u7AEF\u4E2D\u6253\u5F00"'],  // 在终端中打开
        ['"Open PLX dashboard for metadata index "', '"\u6253\u5F00\u5143\u6570\u636E\u7D22\u5F15\u7684 PLX \u4EEA\u8868\u677F "'],  // 打开元数据索引的 PLX 仪表板 
        ['"Open Trajectory Dashboard"', '"\u6253\u5F00\u8F68\u8FF9\u4EEA\u8868\u677F"'],  // 打开轨迹仪表板
        ['"Opened URL in Browser"', '"\u5DF2\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00 URL"'],  // 已在浏览器中打开 URL
        ['"Opening URL in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00 URL"'],  // 正在浏览器中打开 URL
        ['"Opening"', '"\u6253\u5F00\u4E2D"'],  // 打开中
        ['"Opens the associated terminal session in the Terminal tab in your IDE."', '"\u5728 IDE \u7684\u7EC8\u7AEF\u9009\u9879\u5361\u4E2D\u6253\u5F00\u5173\u8054\u7684\u7EC8\u7AEF\u4F1A\u8BDD\u3002"'],  // 在 IDE 的终端选项卡中打开关联的终端会话。
        ['"Out of range index"', '"\u7D22\u5F15\u8D85\u51FA\u8303\u56F4"'],  // 索引超出范围
        ['"Out of range"', '"\u8D85\u51FA\u8303\u56F4"'],  // 超出范围
        ['"Output"', '"\u8F93\u51FA"'],  // 输出
        ['"Overflow"', '"\u6EA2\u51FA"'],  // 溢出
        ['"Page contents"', '"\u9875\u9762\u5185\u5BB9"'],  // 页面内容
        ['"Parentheses"', '"\u5706\u62EC\u53F7"'],  // 圆括号
        ['"Parser was already resumed"', '"\u89E3\u6790\u5668\u5DF2\u6062\u590D"'],  // 解析器已恢复
        ['"Paste or type ID here"', '"\u5728\u6B64\u7C98\u8D34\u6216\u8F93\u5165 ID"'],  // 在此粘贴或输入 ID
        ['"Pending comments"', '"\u5F85\u5904\u7406\u8BC4\u8BBA"'],  // 待处理评论
        ['"Permission denied"', '"\u6743\u9650\u88AB\u62D2\u7EDD"'],  // 权限被拒绝
        ['"Pressed"', '"\u5DF2\u6309\u4E0B"'],  // 已按下
        ['"Pressing"', '"\u6309\u4E0B\u4E2D"'],  // 按下中
        ['"Processing"', '"\u5904\u7406\u4E2D"'],  // 处理中
        ['"Profiler"', '"\u5206\u6790\u5668"'],  // 分析器
        ['"Radius:"', '"\u534A\u5F84:"'],  // 半径:
        ['"Ran extension code"', '"\u5DF2\u8FD0\u884C\u6269\u5C55\u4EE3\u7801"'],  // 已运行扩展代码
        ['"Read Browser Page in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u8BFB\u53D6\u9875\u9762"'],  // 在浏览器中读取页面
        ['"Read page"', '"\u8BFB\u53D6\u9875\u9762"'],  // 读取页面
        ['"Read resource: "', '"\u8BFB\u53D6\u8D44\u6E90: "'],  // 读取资源: 
        ['"Reading Browser Page in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u8BFB\u53D6\u9875\u9762"'],  // 正在浏览器中读取页面
        ['"Reading page"', '"\u6B63\u5728\u8BFB\u53D6\u9875\u9762"'],  // 正在读取页面
        ['"Reading"', '"\u8BFB\u53D6\u4E2D"'],  // 读取中
        ['"Ready"', '"\u5C31\u7EEA"'],  // 就绪
        ['"Recommended"', '"\u63A8\u8350"'],  // 推荐
        ['"Record voice memo"', '"\u5F55\u5236\u8BED\u97F3\u5907\u5FD8"'],  // 录制语音备忘
        ['"Reference"', '"\u5F15\u7528"'],  // 引用
        ['"Refresh Custom Agent Configs"', '"\u5237\u65B0\u81EA\u5B9A\u4E49\u4EE3\u7406\u914D\u7F6E"'],  // 刷新自定义代理配置
        ['"Refresh trajectory list"', '"\u5237\u65B0\u8F68\u8FF9\u5217\u8868"'],  // 刷新轨迹列表
        ['"Rejected extension code"', '"\u5DF2\u62D2\u7EDD\u6269\u5C55\u4EE3\u7801"'],  // 已拒绝扩展代码
        ['"Remove audio"', '"\u79FB\u9664\u97F3\u9891"'],  // 移除音频
        ['"Rendered Step:"', '"\u6E32\u67D3\u6B65\u9AA4:"'],  // 渲染步骤:
        ['"Rendering playback"', '"\u6E32\u67D3\u56DE\u653E"'],  // 渲染回放
        ['"Repositories"', '"\u4ED3\u5E93"'],  // 仓库
        ['"Requested changes"', '"\u8BF7\u6C42\u7684\u66F4\u6539"'],  // 请求的更改
        ['"Resized Browser window"', '"\u5DF2\u8C03\u6574\u6D4F\u89C8\u5668\u7A97\u53E3\u5927\u5C0F"'],  // 已调整浏览器窗口大小
        ['"Resizing Browser window"', '"\u6B63\u5728\u8C03\u6574\u6D4F\u89C8\u5668\u7A97\u53E3\u5927\u5C0F"'],  // 正在调整浏览器窗口大小
        ['"Resource exhausted"', '"\u8D44\u6E90\u8017\u5C3D"'],  // 资源耗尽
        ['"Retrieved Browser Pages"', '"\u5DF2\u83B7\u53D6\u6D4F\u89C8\u5668\u9875\u9762"'],  // 已获取浏览器页面
        ['"Retrieved Console Logs from Browser"', '"\u5DF2\u4ECE\u6D4F\u89C8\u5668\u83B7\u53D6\u63A7\u5236\u53F0\u65E5\u5FD7"'],  // 已从浏览器获取控制台日志
        ['"Retrieved"', '"\u5DF2\u83B7\u53D6"'],  // 已获取
        ['"Retrieving Browser Pages"', '"\u6B63\u5728\u83B7\u53D6\u6D4F\u89C8\u5668\u9875\u9762"'],  // 正在获取浏览器页面
        ['"Retrieving Console Logs from Browser"', '"\u6B63\u5728\u4ECE\u6D4F\u89C8\u5668\u83B7\u53D6\u63A7\u5236\u53F0\u65E5\u5FD7"'],  // 正在从浏览器获取控制台日志
        ['"Retrieving"', '"\u83B7\u53D6\u4E2D"'],  // 获取中
        ['"Right"', '"\u53F3"'],  // 右
        ['"Run code?"', '"\u8FD0\u884C\u4EE3\u7801?"'],  // 运行代码?
        ['"Run command?"', '"\u8FD0\u884C\u547D\u4EE4?"'],  // 运行命令?
        ['"Run extension code"', '"\u8FD0\u884C\u6269\u5C55\u4EE3\u7801"'],  // 运行扩展代码
        ['"Running extension code"', '"\u6B63\u5728\u8FD0\u884C\u6269\u5C55\u4EE3\u7801"'],  // 正在运行扩展代码
        ['"Scroll to bottom"', '"\u6EDA\u52A8\u5230\u5E95\u90E8"'],  // 滚动到底部
        ['"Scrolled down in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u5411\u4E0B\u6EDA\u52A8"'],  // 在浏览器中向下滚动
        ['"Scrolled in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u6EDA\u52A8"'],  // 在浏览器中滚动
        ['"Scrolled up in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u5411\u4E0A\u6EDA\u52A8"'],  // 在浏览器中向上滚动
        ['"Scrolled"', '"\u5DF2\u6EDA\u52A8"'],  // 已滚动
        ['"Scrolling down in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u5411\u4E0B\u6EDA\u52A8"'],  // 正在浏览器中向下滚动
        ['"Scrolling in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u6EDA\u52A8"'],  // 正在浏览器中滚动
        ['"Scrolling up in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u5411\u4E0A\u6EDA\u52A8"'],  // 正在浏览器中向上滚动
        ['"Searched"', '"\u5DF2\u641C\u7D22"'],  // 已搜索
        ['"Searching"', '"\u641C\u7D22\u4E2D"'],  // 搜索中
        ['"Seconds"', '"\u79D2"'],  // 秒
        ['"Sections"', '"\u90E8\u5206"'],  // 部分
        ['"See our"', '"\u67E5\u770B\u6211\u4EEC\u7684"'],  // 查看我们的
        ['"See plans"', '"\u67E5\u770B\u65B9\u6848"'],  // 查看方案
        ['"Segment Metrics"', '"\u5206\u6BB5\u6307\u6807"'],  // 分段指标
        ['"Select a model using the model selector in the input box"', '"\u4F7F\u7528\u8F93\u5165\u6846\u4E2D\u7684\u6A21\u578B\u9009\u62E9\u5668\u9009\u62E9\u6A21\u578B"'],  // 使用输入框中的模型选择器选择模型
        ['"Select from known"', '"\u4ECE\u5DF2\u77E5\u4E2D\u9009\u62E9"'],  // 从已知中选择
        ['"Select Model:"', '"\u9009\u62E9\u6A21\u578B:"'],  // 选择模型:
        ['"Select Option in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u9009\u62E9\u9009\u9879"'],  // 在浏览器中选择选项
        ['"Select option"', '"\u9009\u62E9\u9009\u9879"'],  // 选择选项
        ['"Selecting Option in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u9009\u62E9\u9009\u9879"'],  // 正在浏览器中选择选项
        ['"Semantic searched"', '"\u5DF2\u8BED\u4E49\u641C\u7D22"'],  // 已语义搜索
        ['"Semantic searching"', '"\u8BED\u4E49\u641C\u7D22\u4E2D"'],  // 语义搜索中
        ['"Send feedback"', '"\u53D1\u9001\u53CD\u9988"'],  // 发送反馈
        ['"Shapes"', '"\u5F62\u72B6"'],  // 形状
        ['"Sheet"', '"\u8868\u683C"'],  // 表格
        ['"Sherlog Links"', '"Sherlog \u94FE\u63A5"'],  // Sherlog 链接
        ['"Show 0s"', '"\u663E\u793A 0 \u79D2"'],  // 显示 0 秒
        ['"Show all resources"', '"\u663E\u793A\u6240\u6709\u8D44\u6E90"'],  // 显示所有资源
        ['"Show allowlist"', '"\u663E\u793A\u5141\u8BB8\u5217\u8868"'],  // 显示允许列表
        ['"Show fewer resources"', '"\u663E\u793A\u8F83\u5C11\u8D44\u6E90"'],  // 显示较少资源
        ['"Show less"', '"\u663E\u793A\u66F4\u5C11"'],  // 显示更少
        ['"Show page allowlist"', '"\u663E\u793A\u9875\u9762\u5141\u8BB8\u5217\u8868"'],  // 显示页面允许列表
        ['"Simulated Key Press in Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u6A21\u62DF\u6309\u952E"'],  // 在浏览器中模拟按键
        ['"Simulating Key Press in Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u6A21\u62DF\u6309\u952E"'],  // 正在浏览器中模拟按键
        ['"Site Allowlist"', '"\u7F51\u7AD9\u5141\u8BB8\u5217\u8868"'],  // 网站允许列表
        ['"Some non-image binary content was truncated."', '"\u90E8\u5206\u975E\u56FE\u50CF\u4E8C\u8FDB\u5236\u5185\u5BB9\u5DF2\u88AB\u622A\u65AD\u3002"'],  // 部分非图像二进制内容已被截断。
        ['"Source:"', '"\u6765\u6E90:"'],  // 来源:
        ['"Step handler not available"', '"\u6B65\u9AA4\u5904\u7406\u7A0B\u5E8F\u4E0D\u53EF\u7528"'],  // 步骤处理程序不可用
        ['"Step JSON:"', '"\u6B65\u9AA4 JSON:"'],  // 步骤 JSON:
        ['"Step Type"', '"\u6B65\u9AA4\u7C7B\u578B"'],  // 步骤类型
        ['"Step:"', '"\u6B65\u9AA4:"'],  // 步骤:
        ['"Stop recording"', '"\u505C\u6B62\u5F55\u5236"'],  // 停止录制
        ['"Subagent Context Mode:"', '"\u5B50\u4EE3\u7406\u4E0A\u4E0B\u6587\u6A21\u5F0F:"'],  // 子代理上下文模式:
        ['"Subagent Reminder Mode:"', '"\u5B50\u4EE3\u7406\u63D0\u9192\u6A21\u5F0F:"'],  // 子代理提醒模式:
        ['"System Message"', '"\u7CFB\u7EDF\u6D88\u606F"'],  // 系统消息
        ['"Take trajectory snapshot"', '"\u62CD\u6444\u8F68\u8FF9\u5FEB\u7167"'],  // 拍摄轨迹快照
        ['"Taking Screenshot"', '"\u6B63\u5728\u622A\u56FE"'],  // 正在截图
        ['"Terminal command"', '"\u7EC8\u7AEF\u547D\u4EE4"'],  // 终端命令
        ['"This operation was aborted"', '"\u6B64\u64CD\u4F5C\u5DF2\u4E2D\u6B62"'],  // 此操作已中止
        ['"This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."', '"\u6B64\u6D4F\u89C8\u5668\u7F3A\u5C11 `buffer` v5.x \u6240\u9700\u7684\u7C7B\u578B\u5316\u6570\u7EC4 (Uint8Array) \u652F\u6301\u3002\u5982\u679C\u9700\u8981\u65E7\u6D4F\u89C8\u5668\u652F\u6301\uFF0C\u8BF7\u4F7F\u7528 `buffer` v4.x\u3002"'],  // 此浏览器缺少 `buffer` v5.x 所需的类型化数组 (Uint8Array) 支持。如果需要旧浏览器支持，请使用 `buffer` v4.x。
        ['"To provide feedback"', '"\u63D0\u4F9B\u53CD\u9988"'],  // 提供反馈
        ['"Toggle Debug Mode"', '"\u5207\u6362\u8C03\u8BD5\u6A21\u5F0F"'],  // 切换调试模式
        ['"Toggle Debug Sidebar"', '"\u5207\u6362\u8C03\u8BD5\u4FA7\u8FB9\u680F"'],  // 切换调试侧边栏
        ['"Toggle Dev View"', '"\u5207\u6362\u5F00\u53D1\u89C6\u56FE"'],  // 切换开发视图
        ['"Toggle Ephemeral Messages"', '"\u5207\u6362\u4E34\u65F6\u6D88\u606F"'],  // 切换临时消息
        ['"Toggle Incognito Mode"', '"\u5207\u6362\u65E0\u75D5\u6A21\u5F0F"'],  // 切换无痕模式
        ['"Took Screenshot"', '"\u5DF2\u622A\u56FE"'],  // 已截图
        ['"Tool Calls"', '"\u5DE5\u5177\u8C03\u7528"'],  // 工具调用
        ['"Trajectory ID"', '"\u8F68\u8FF9 ID"'],  // 轨迹 ID
        ['"Trajectory Metrics"', '"\u8F68\u8FF9\u6307\u6807"'],  // 轨迹指标
        ['"Trajectory Snapshot"', '"\u8F68\u8FF9\u5FEB\u7167"'],  // 轨迹快照
        ['"Trajectory Stats"', '"\u8F68\u8FF9\u7EDF\u8BA1"'],  // 轨迹统计
        ['"Trigger must be a single character"', '"\u89E6\u53D1\u5668\u5FC5\u987B\u662F\u5355\u4E2A\u5B57\u7B26"'],  // 触发器必须是单个字符
        ['"Trigger must be one character long"', '"\u89E6\u53D1\u5668\u957F\u5EA6\u5FC5\u987B\u4E3A\u4E00\u4E2A\u5B57\u7B26"'],  // 触发器长度必须为一个字符
        ['"Trying to access beyond buffer length"', '"\u5C1D\u8BD5\u8BBF\u95EE\u8D85\u51FA\u7F13\u51B2\u533A\u957F\u5EA6"'],  // 尝试访问超出缓冲区长度
        ['"Type into Browser"', '"\u5728\u6D4F\u89C8\u5668\u4E2D\u8F93\u5165"'],  // 在浏览器中输入
        ['"Typeahead menu"', '"\u81EA\u52A8\u5B8C\u6210\u83DC\u5355"'],  // 自动完成菜单
        ['"Typing into Browser"', '"\u6B63\u5728\u6D4F\u89C8\u5668\u4E2D\u8F93\u5165"'],  // 正在浏览器中输入
        ['"Unauthenticated"', '"\u672A\u8BA4\u8BC1"'],  // 未认证
        ['"Unavailable"', '"\u4E0D\u53EF\u7528"'],  // 不可用
        ['"Underflow"', '"\u4E0B\u6EA2"'],  // 下溢
        ['"Undo changes up to this point"', '"\u64A4\u9500\u5230\u6B64\u5904\u7684\u66F4\u6539"'],  // 撤销到此处的更改
        ['"Unexpected undefined"', '"\u610F\u5916\u7684\u672A\u5B9A\u4E49"'],  // 意外的未定义
        ['"Unidentified"', '"\u672A\u8BC6\u522B"'],  // 未识别
        ['"Unimplemented"', '"\u672A\u5B9E\u73B0"'],  // 未实现
        ['"Unknown error fetching browser pages"', '"\u83B7\u53D6\u6D4F\u89C8\u5668\u9875\u9762\u65F6\u53D1\u751F\u672A\u77E5\u9519\u8BEF"'],  // 获取浏览器页面时发生未知错误
        ['"Unknown error occurred"', '"\u53D1\u751F\u672A\u77E5\u9519\u8BEF"'],  // 发生未知错误
        ['"Unknown error"', '"\u672A\u77E5\u9519\u8BEF"'],  // 未知错误
        ['"Unknown path"', '"\u672A\u77E5\u8DEF\u5F84"'],  // 未知路径
        ['"Unknown quota limit error reason"', '"\u672A\u77E5\u914D\u989D\u9650\u5236\u9519\u8BEF\u539F\u56E0"'],  // 未知配额限制错误原因
        ['"Unknown state"', '"\u672A\u77E5\u72B6\u6001"'],  // 未知状态
        ['"Unmount"', '"\u5378\u8F7D"'],  // 卸载
        ['"Unnamed resource"', '"\u672A\u547D\u540D\u8D44\u6E90"'],  // 未命名资源
        ['"Unsupported browser target"', '"\u4E0D\u652F\u6301\u7684\u6D4F\u89C8\u5668\u76EE\u6807"'],  // 不支持的浏览器目标
        ['"untitled"', '"\u672A\u547D\u540D"'],  // 未命名
        ['"Upload to Agent"', '"\u4E0A\u4F20\u5230\u4EE3\u7406"'],  // 上传到代理
        ['"Upload"', '"\u4E0A\u4F20"'],  // 上传
        ['"User Implicit Trajectories"', '"\u7528\u6237\u9690\u5F0F\u8F68\u8FF9"'],  // 用户隐式轨迹
        ['"User Implicit"', '"\u7528\u6237\u9690\u5F0F"'],  // 用户隐式
        ['"User uploaded image"', '"\u7528\u6237\u4E0A\u4F20\u7684\u56FE\u50CF"'],  // 用户上传的图像
        ['"Users"', '"\u7528\u6237"'],  // 用户
        ['"Uses your API key"', '"\u4F7F\u7528\u60A8\u7684 API \u5BC6\u94A5"'],  // 使用您的 API 密钥
        ['"Value"', '"\u503C"'],  // 值
        ['"Visible only"', '"\u4EC5\u53EF\u89C1"'],  // 仅可见
        ['"Wait for"', '"\u7B49\u5F85"'],  // 等待
        ['"Waiting"', '"\u7B49\u5F85\u4E2D"'],  // 等待中
        ['"When debug mode is on, you can see additional information about each steps in the conversation."', '"\u5F00\u542F\u8C03\u8BD5\u6A21\u5F0F\u540E\uFF0C\u60A8\u53EF\u4EE5\u67E5\u770B\u5BF9\u8BDD\u4E2D\u6BCF\u4E2A\u6B65\u9AA4\u7684\u989D\u5916\u4FE1\u606F\u3002"'],  // 开启调试模式后，您可以查看对话中每个步骤的额外信息。
        ['"With Markdown Trajectory Summary"', '"\u5305\u542B Markdown \u8F68\u8FF9\u6458\u8981"'],  // 包含 Markdown 轨迹摘要
        ['"Unleash failed to resolve \\"fetch\\""', '"Unleash \u65E0\u6CD5\u89E3\u6790 \\"fetch\\""'],  // Unleash \u65E0\u6CD5\u89E3\u6790 \\"fetch\\"
        ['"Unleash failed to resolve \\"AbortController\\" factory"', '"Unleash \u65E0\u6CD5\u89E3\u6790 \\"AbortController\\" \u5DE5\u5382"'],  // Unleash \u65E0\u6CD5\u89E3\u6790 \\"AbortController\\" \u5DE5\u5382
        ['"Unleash: You must either provide your own \\"fetch\\" implementation or run in an environment where \\"fetch\\" is available."', '"Unleash: \u60A8\u5FC5\u987B\u63D0\u4F9B\u81EA\u5DF1\u7684 \\"fetch\\" \u5B9E\u73B0\uFF0C\u6216\u5728 \\"fetch\\" \u53EF\u7528\u7684\u73AF\u5883\u4E2D\u8FD0\u884C\u3002"'],  // Unleash: \u60A8\u5FC5\u987B\u63D0\u4F9B\u81EA\u5DF1\u7684 \\"fetch\\" \u5B9E\u73B0\uFF0C\u6216\u5728 \\"fetch\\" \u53EF\u7528\u7684\u73AF\u5883\u4E2D\u8FD0\u884C\u3002
        ['"Unleash: You must either provide your own \\"AbortController\\" implementation or run in an environment where \\"AbortController\\" is available."', '"Unleash: \u60A8\u5FC5\u987B\u63D0\u4F9B\u81EA\u5DF1\u7684 \\"AbortController\\" \u5B9E\u73B0\uFF0C\u6216\u5728 \\"AbortController\\" \u53EF\u7528\u7684\u73AF\u5883\u4E2D\u8FD0\u884C\u3002"'],  // Unleash: \u60A8\u5FC5\u987B\u63D0\u4F9B\u81EA\u5DF1\u7684 \\"AbortController\\" \u5B9E\u73B0\uFF0C\u6216\u5728 \\"AbortController\\" \u53EF\u7528\u7684\u73AF\u5883\u4E2D\u8FD0\u884C\u3002
        ['"Unleash SDK has already started, if you want to restart the SDK you should call client.stop() before starting again."', '"Unleash SDK \u5DF2\u542F\u52A8\uFF0C\u5982\u679C\u8981\u91CD\u65B0\u542F\u52A8 SDK\uFF0C\u5E94\u5148\u8C03\u7528 client.stop()\u3002"'],  // Unleash SDK 已启动，如果要重新启动 SDK，应先调用 client.stop()。
        ['"Unleash: Fetching feature toggles did not have an ok response"', '"Unleash: \u83B7\u53D6\u529F\u80FD\u5F00\u5173\u672A\u6536\u5230\u6B63\u5E38\u54CD\u5E94"'],  // Unleash: 获取功能开关未收到正常响应
        ['"Unleash: unable to fetch feature toggles"', '"Unleash: \u65E0\u6CD5\u83B7\u53D6\u529F\u80FD\u5F00\u5173"'],  // Unleash: 无法获取功能开关
        ['"Unleash: unable to send feature metrics"', '"Unleash: \u65E0\u6CD5\u53D1\u9001\u529F\u80FD\u6307\u6807"'],  // Unleash: 无法发送功能指标
        ['"on() must be used within a FlagProvider"', '"on() \u5FC5\u987B\u5728 FlagProvider \u4E2D\u4F7F\u7528"'],  // on() 必须在 FlagProvider 中使用
        ['"off() must be used within a FlagProvider"', '"off() \u5FC5\u987B\u5728 FlagProvider \u4E2D\u4F7F\u7528"'],  // off() 必须在 FlagProvider 中使用
        ['"updateContext() must be used within a FlagProvider"', '"updateContext() \u5FC5\u987B\u5728 FlagProvider \u4E2D\u4F7F\u7528"'],  // updateContext() 必须在 FlagProvider 中使用
        ['"isEnabled() must be used within a FlagProvider"', '"isEnabled() \u5FC5\u987B\u5728 FlagProvider \u4E2D\u4F7F\u7528"'],  // isEnabled() 必须在 FlagProvider 中使用
        ['"getVariant() must be used within a FlagProvider"', '"getVariant() \u5FC5\u987B\u5728 FlagProvider \u4E2D\u4F7F\u7528"'],  // getVariant() 必须在 FlagProvider 中使用
        ['"useOnSendMessageContext must be used within an OnSendMessageContextProvider"', '"useOnSendMessageContext \u5FC5\u987B\u5728 OnSendMessageContextProvider \u4E2D\u4F7F\u7528"'],  // useOnSendMessageContext 必须在 OnSendMessageContextProvider 中使用
        ['"Failed to update conversation annotations:"', '"\u66F4\u65B0\u5BF9\u8BDD\u6CE8\u91CA\u5931\u8D25:"'],  // 更新对话注释失败:
        ['"Auto Agent not supported at GDM (yet)"', '"GDM \u6682\u4E0D\u652F\u6301\u81EA\u52A8\u4EE3\u7406"'],  // GDM 暂不支持自动代理
        ['"Failed to send message"', '"\u53D1\u9001\u6D88\u606F\u5931\u8D25"'],  // 发送消息失败
        ['"Error fetching model statuses:"', '"\u83B7\u53D6\u6A21\u578B\u72B6\u6001\u65F6\u51FA\u9519:"'],  // 获取模型状态时出错:
        ['"Exception in backgroundFetchModelStatuses:"', '"backgroundFetchModelStatuses \u4E2D\u53D1\u751F\u5F02\u5E38:"'],  // backgroundFetchModelStatuses 中发生异常:
        ['"Failed to fetch user status:"', '"\u83B7\u53D6\u7528\u6237\u72B6\u6001\u5931\u8D25:"'],  // 获取用户状态失败:
        ['"[Paste Interceptor] No selection found"', '"[\u7C98\u8D34\u62E6\u622A\u5668] \u672A\u627E\u5230\u9009\u62E9\u5185\u5BB9"'],  // [粘贴拦截器] 未找到选择内容
        ['"No trigger was found for the editor"', '"\u672A\u627E\u5230\u7F16\u8F91\u5668\u7684\u89E6\u53D1\u5668"'],  // 未找到编辑器的触发器
        ['"Error fetching workflows:"', '"\u83B7\u53D6\u5DE5\u4F5C\u6D41\u65F6\u51FA\u9519:"'],  // 获取工作流时出错:
        ['"Error fetching rules:"', '"\u83B7\u53D6\u89C4\u5219\u65F6\u51FA\u9519:"'],  // 获取规则时出错:
        ['"Error listing MCP resources:"', '"\u5217\u51FA MCP \u8D44\u6E90\u65F6\u51FA\u9519:"'],  // 列出 MCP 资源时出错:
        ['"Error listing terminals:"', '"\u5217\u51FA\u7EC8\u7AEF\u65F6\u51FA\u9519:"'],  // 列出终端时出错:
        ['"Error listing MCP server names:"', '"\u5217\u51FA MCP \u670D\u52A1\u5668\u540D\u79F0\u65F6\u51FA\u9519:"'],  // 列出 MCP 服务器名称时出错:
        ['"Failed to open Review Changes:"', '"\u6253\u5F00\u5BA1\u67E5\u66F4\u6539\u5931\u8D25:"'],  // 打开审查更改失败:
        ['"Failed to get workspace infos:"', '"\u83B7\u53D6\u5DE5\u4F5C\u533A\u4FE1\u606F\u5931\u8D25:"'],  // 获取工作区信息失败:
        ['"Failed to export conversation:"', '"\u5BFC\u51FA\u5BF9\u8BDD\u5931\u8D25:"'],  // 导出对话失败:
        ['"Error fetching MCP servers:"', '"\u83B7\u53D6 MCP \u670D\u52A1\u5668\u65F6\u51FA\u9519:"'],  // 获取 MCP 服务器时出错:
        ['"Error: unable to parse context item"', '"\u9519\u8BEF: \u65E0\u6CD5\u89E3\u6790\u4E0A\u4E0B\u6587\u9879"'],  // 错误: 无法解析上下文项
        ['"Error in connection error handler:"', '"\u8FDE\u63A5\u9519\u8BEF\u5904\u7406\u7A0B\u5E8F\u4E2D\u51FA\u9519:"'],  // 连接错误处理程序中出错:
        ['"Unknown request case:"', '"\u672A\u77E5\u8BF7\u6C42\u7C7B\u578B:"'],  // 未知请求类型:
        ['"Unexpected error starting chat client server stream:"', '"\u542F\u52A8\u804A\u5929\u5BA2\u6237\u7AEF\u670D\u52A1\u5668\u6D41\u65F6\u53D1\u751F\u610F\u5916\u9519\u8BEF:"'],  // 启动聊天客户端服务器流时发生意外错误:
        ['"Chat client server stream canceled by original abort signal"', '"\u804A\u5929\u5BA2\u6237\u7AEF\u670D\u52A1\u5668\u6D41\u88AB\u539F\u59CB\u4E2D\u6B62\u4FE1\u53F7\u53D6\u6D88"'],  // 聊天客户端服务器流被原始中止信号取消
        ['"Error starting chat client server stream:"', '"\u542F\u52A8\u804A\u5929\u5BA2\u6237\u7AEF\u670D\u52A1\u5668\u6D41\u65F6\u51FA\u9519:"'],  // 启动聊天客户端服务器流时出错:
        ['"Failed to update user settings:"', '"\u66F4\u65B0\u7528\u6237\u8BBE\u7F6E\u5931\u8D25:"'],  // 更新用户设置失败:
        ['"Error sharing trajectory:"', '"\u5206\u4EAB\u8F68\u8FF9\u65F6\u51FA\u9519:"'],  // 分享轨迹时出错:
        ['"forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"', '"forceFrameRate \u63A5\u53D7 0 \u5230 125 \u4E4B\u95F4\u7684\u6B63\u6574\u6570\uFF0C\u4E0D\u652F\u6301\u5F3A\u5236\u5E27\u7387\u9AD8\u4E8E 125 fps"'],  // forceFrameRate 接受 0 到 125 之间的正整数，不支持强制帧率高于 125 fps
        ['"A component is changing from controlled to uncontrolled. This may be caused by the value changing from a defined value to undefined, which should not happen."', '"\u7EC4\u4EF6\u6B63\u5728\u4ECE\u53D7\u63A7\u53D8\u4E3A\u975E\u53D7\u63A7\u3002\u8FD9\u53EF\u80FD\u662F\u7531\u4E8E\u503C\u4ECE\u5DF2\u5B9A\u4E49\u53D8\u4E3A undefined\uFF0C\u8FD9\u4E0D\u5E94\u8BE5\u53D1\u751F\u3002"'],  // 组件正在从受控变为非受控。这可能是由于值从已定义变为 undefined，这不应该发生。
        ['"A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen."', '"\u7EC4\u4EF6\u6B63\u5728\u4ECE\u975E\u53D7\u63A7\u53D8\u4E3A\u53D7\u63A7\u3002\u8FD9\u53EF\u80FD\u662F\u7531\u4E8E\u503C\u4ECE undefined \u53D8\u4E3A\u5DF2\u5B9A\u4E49\u503C\uFF0C\u8FD9\u4E0D\u5E94\u8BE5\u53D1\u751F\u3002"'],  // 组件正在从非受控变为受控。这可能是由于值从 undefined 变为已定义值，这不应该发生。
        ['"Nonretryable error starting chat client server stream:"', '"\u542F\u52A8\u804A\u5929\u5BA2\u6237\u7AEF\u670D\u52A1\u5668\u6D41\u65F6\u53D1\u751F\u4E0D\u53EF\u91CD\u8BD5\u9519\u8BEF:"'],  // 启动聊天客户端服务器流时发生不可重试错误:
        ['"Error copying to clipboard:"', '"\u590D\u5236\u5230\u526A\u8D34\u677F\u65F6\u51FA\u9519:"'],  // 复制到剪贴板时出错:
        ['"Failed to capture browser console logs: No console logs found"', '"\u6355\u83B7\u6D4F\u89C8\u5668\u63A7\u5236\u53F0\u65E5\u5FD7\u5931\u8D25: \u672A\u627E\u5230\u63A7\u5236\u53F0\u65E5\u5FD7"'],  // 捕获浏览器控制台日志失败: 未找到控制台日志
        ['"Failed to capture browser console logs:"', '"\u6355\u83B7\u6D4F\u89C8\u5668\u63A7\u5236\u53F0\u65E5\u5FD7\u5931\u8D25:"'],  // 捕获浏览器控制台日志失败:
        ['"Failed to capture screenshot:"', '"\u6355\u83B7\u622A\u56FE\u5931\u8D25:"'],  // 捕获截图失败:
        ['"Failed to fetch revert preview:"', '"\u83B7\u53D6\u8FD8\u539F\u9884\u89C8\u5931\u8D25:"'],  // 获取还原预览失败:
        ['"Error opening MCP page:"', '"\u6253\u5F00 MCP \u9875\u9762\u65F6\u51FA\u9519:"'],  // 打开 MCP 页面时出错:
        ['"Error opening MCP config modal:"', '"\u6253\u5F00 MCP \u914D\u7F6E\u5F39\u7A97\u65F6\u51FA\u9519:"'],  // 打开 MCP 配置弹窗时出错:
        ['"Error opening configure page:"', '"\u6253\u5F00\u914D\u7F6E\u9875\u9762\u65F6\u51FA\u9519:"'],  // 打开配置页面时出错:
        ['"Error parsing file diff JSON data:"', '"\u89E3\u6790\u6587\u4EF6\u5DEE\u5F02 JSON \u6570\u636E\u65F6\u51FA\u9519:"'],  // 解析文件差异 JSON 数据时出错:
        ['"Failed to close all diff zones:"', '"\u5173\u95ED\u6240\u6709\u5DEE\u5F02\u533A\u57DF\u5931\u8D25:"'],  // 关闭所有差异区域失败:
        ['"Browser is not enabled for this plan"', '"\u6B64\u8BA1\u5212\u672A\u542F\u7528\u6D4F\u89C8\u5668\u529F\u80FD"'],  // 此计划未启用浏览器功能
        ['"URL is required"', '"\u9700\u8981 URL"'],  // 需要 URL
        ['"url is required"', '"\u9700\u8981 url"'],  // 需要 url
        ['"Missing API key. Please make sure you are signed in to Antigravity. If the problem persists, please restart the IDE."', '"\u7F3A\u5C11 API \u5BC6\u94A5\u3002\u8BF7\u786E\u4FDD\u60A8\u5DF2\u767B\u5F55 Antigravity\u3002\u5982\u679C\u95EE\u9898\u4ECD\u7136\u5B58\u5728\uFF0C\u8BF7\u91CD\u542F IDE\u3002"'],  // 缺少 API 密钥。请确保您已登录 Antigravity。如果问题仍然存在，请重启 IDE。
        ['"Function not implemented."', '"\u529F\u80FD\u672A\u5B9E\u73B0\u3002"'],  // 功能未实现。
        ['"clientKey is required"', '"\u9700\u8981 clientKey"'],  // 需要 clientKey
        ['"appName is required."', '"\u9700\u8981 appName\u3002"'],  // 需要 appName。
        ['"Objects are not valid as a React child (found: "', '"\u5BF9\u8C61\u4E0D\u662F\u6709\u6548\u7684 React \u5B50\u5143\u7D20 (\u53D1\u73B0: "'],  // 对象不是有效的 React 子元素 (发现: 
        ['"React.Children.only expected to receive a single React element child."', '"React.Children.only \u671F\u671B\u63A5\u6536\u5355\u4E2A React \u5143\u7D20\u5B50\u8282\u70B9\u3002"'],  // React.Children.only 期望接收单个 React 元素子节点。
        ['"Unknown encoding: "', '"\u672A\u77E5\u7F16\u7801: "'],  // 未知编码: 
        ['"out of range index"', '"\u7D22\u5F15\u8D85\u51FA\u8303\u56F4"'],  // 索引超出范围
        ['"BigInt not supported"', '"\u4E0D\u652F\u6301 BigInt"'],  // 不支持 BigInt
        ['"invalid base64 string."', '"\u65E0\u6548\u7684 base64 \u5B57\u7B26\u4E32\u3002"'],  // 无效的 base64 字符串。
        ['"invalid UTF8"', '"\u65E0\u6548\u7684 UTF8"'],  // 无效的 UTF8
        ['"premature EOF"', '"\u8FC7\u65E9\u7684\u6587\u4EF6\u7ED3\u675F"'],  // 过早的文件结束
        ['"useLanguageServerContext must be used within a LanguageServerContextProvider"', '"useLanguageServerContext \u5FC5\u987B\u5728 LanguageServerContextProvider \u4E2D\u4F7F\u7528"'],  // useLanguageServerContext 必须在 LanguageServerContextProvider 中使用
        ['"useContextMenuContext must be used within a ContextMenuProvider"', '"useContextMenuContext \u5FC5\u987B\u5728 ContextMenuProvider \u4E2D\u4F7F\u7528"'],  // useContextMenuContext 必须在 ContextMenuProvider 中使用
        ['"useAgentWorkbenchContext must be used within an AgentWorkbenchContextProvider"', '"useAgentWorkbenchContext \u5FC5\u987B\u5728 AgentWorkbenchContextProvider \u4E2D\u4F7F\u7528"'],  // useAgentWorkbenchContext 必须在 AgentWorkbenchContextProvider 中使用
        ['"useBrowserContext must be used within a BrowserContextProvider"', '"useBrowserContext \u5FC5\u987B\u5728 BrowserContextProvider \u4E2D\u4F7F\u7528"'],  // useBrowserContext 必须在 BrowserContextProvider 中使用
        ['"useRegisterChatClientRequestHandler must be used within a ChatClientServerContextProvider"', '"useRegisterChatClientRequestHandler \u5FC5\u987B\u5728 ChatClientServerContextProvider \u4E2D\u4F7F\u7528"'],  // useRegisterChatClientRequestHandler 必须在 ChatClientServerContextProvider 中使用
        ['"useTrajectorySummariesContext must be used within a TrajectorySummariesProvider"', '"useTrajectorySummariesContext \u5FC5\u987B\u5728 TrajectorySummariesProvider \u4E2D\u4F7F\u7528"'],  // useTrajectorySummariesContext 必须在 TrajectorySummariesProvider 中使用
        ['"useMessageHistoryContext must be used within a MessageHistoryContextProvider"', '"useMessageHistoryContext \u5FC5\u987B\u5728 MessageHistoryContextProvider \u4E2D\u4F7F\u7528"'],  // useMessageHistoryContext 必须在 MessageHistoryContextProvider 中使用
        ['"useTokenThemeContext must be used within a TokenThemeContextProvider"', '"useTokenThemeContext \u5FC5\u987B\u5728 TokenThemeContextProvider \u4E2D\u4F7F\u7528"'],  // useTokenThemeContext 必须在 TokenThemeContextProvider 中使用
        ['"You have to provide an `open` and an `onClose` prop to the `Dialog` component."', '"\u60A8\u5FC5\u987B\u4E3A `Dialog` \u7EC4\u4EF6\u63D0\u4F9B `open` \u548C `onClose` \u5C5E\u6027\u3002"'],  // 您必须为 `Dialog` 组件提供 `open` 和 `onClose` 属性。
        ['"You provided an `onClose` prop to the `Dialog`, but forgot an `open` prop."', '"\u60A8\u4E3A `Dialog` \u63D0\u4F9B\u4E86 `onClose` \u5C5E\u6027\uFF0C\u4F46\u5FD8\u8BB0\u4E86 `open` \u5C5E\u6027\u3002"'],  // 您为 `Dialog` 提供了 `onClose` 属性，但忘记了 `open` 属性。
        ['"You provided an `open` prop to the `Dialog`, but forgot an `onClose` prop."', '"\u60A8\u4E3A `Dialog` \u63D0\u4F9B\u4E86 `open` \u5C5E\u6027\uFF0C\u4F46\u5FD8\u8BB0\u4E86 `onClose` \u5C5E\u6027\u3002"'],  // 您为 `Dialog` 提供了 `open` 属性，但忘记了 `onClose` 属性。
        ['"Path must be a string. Received "', '"\u8DEF\u5F84\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002\u6536\u5230 "'],  // 路径必须是字符串。收到 
        ['"The URL must be of scheme file"', '"URL \u5FC5\u987B\u662F file \u534F\u8BAE"'],  // URL 必须是 file 协议
        ['"Generator is already executing."', '"\u751F\u6210\u5668\u5DF2\u5728\u6267\u884C\u4E2D\u3002"'],  // 生成器已在执行中。
        ['"Unknown unit "', '"\u672A\u77E5\u5355\u4F4D "'],  // 未知单位 
        ['"Unexpected object: "', '"\u610F\u5916\u7684\u5BF9\u8C61: "'],  // 意外的对象: 
        ['"unable to serialize "', '"\u65E0\u6CD5\u5E8F\u5217\u5316 "'],  // 无法序列化 
        ['"This undo action will not make any code changes."', '"\u6B64\u64A4\u9500\u64CD\u4F5C\u4E0D\u4F1A\u8FDB\u884C\u4EFB\u4F55\u4EE3\u7801\u66F4\u6539\u3002"'],  // 此撤销操作不会进行任何代码更改。
        ['"Messages can be sent while the agent is still working and your message will be queued and taken into consideration at the next available break in reasoning."', '"\u60A8\u53EF\u4EE5\u5728\u4EE3\u7406\u4ECD\u5728\u5DE5\u4F5C\u65F6\u53D1\u9001\u6D88\u606F\uFF0C\u60A8\u7684\u6D88\u606F\u5C06\u88AB\u6392\u961F\uFF0C\u5E76\u5728\u4E0B\u4E00\u4E2A\u53EF\u7528\u7684\u63A8\u7406\u95F4\u6B47\u65F6\u88AB\u8003\u8651\u3002"'],  // 您可以在代理仍在工作时发送消息，您的消息将被排队，并在下一个可用的推理间歇时被考虑。
        ['"This tool runs code that can access IDE extension APIs and potentially change the functionality of your IDE the same way that an IDE extension or plugin can."', '"\u6B64\u5DE5\u5177\u8FD0\u884C\u7684\u4EE3\u7801\u53EF\u4EE5\u8BBF\u95EE IDE \u6269\u5C55 API\uFF0C\u5E76\u53EF\u80FD\u4EE5\u4E0E IDE \u6269\u5C55\u6216\u63D2\u4EF6\u76F8\u540C\u7684\u65B9\u5F0F\u66F4\u6539 IDE \u7684\u529F\u80FD\u3002"'],  // 此工具运行的代码可以访问 IDE 扩展 API，并可能以与 IDE 扩展或插件相同的方式更改 IDE 的功能。
        ['"Too many requests, please try again in a bit!"', '"\u8BF7\u6C42\u8FC7\u591A\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\uFF01"'],  // 请求过多，请稍后重试！
        ['"This error is likely temporary. You can prompt the model to try again after some time."', '"\u6B64\u9519\u8BEF\u53EF\u80FD\u662F\u6682\u65F6\u7684\u3002\u60A8\u53EF\u4EE5\u7A0D\u540E\u63D0\u793A\u6A21\u578B\u91CD\u8BD5\u3002"'],  // 此错误可能是暂时的。您可以稍后提示模型重试。
        ['"Get notified when the agent needs your attention or completes a task."', '"\u5F53\u4EE3\u7406\u9700\u8981\u60A8\u6CE8\u610F\u6216\u5B8C\u6210\u4EFB\u52A1\u65F6\u83B7\u5F97\u901A\u77E5\u3002"'],  // 当代理需要您注意或完成任务时获得通知。
        ['"This model is currently experiencing some issues."', '"\u6B64\u6A21\u578B\u5F53\u524D\u9047\u5230\u4E00\u4E9B\u95EE\u9898\u3002"'],  // 此模型当前遇到一些问题。
        ['"Failed to load "', '"\u52A0\u8F7D\u5931\u8D25 "'],  // 加载失败 
        ['"Did you make sure to report this error on Slack?"', '"\u60A8\u786E\u5B9A\u5DF2\u5728 Slack \u4E0A\u62A5\u544A\u6B64\u9519\u8BEF\u4E86\u5417\uFF1F"'],  // 您确定已在 Slack 上报告此错误了吗？
        ['"Standard conversational mode."', '"\u6807\u51C6\u5BF9\u8BDD\u6A21\u5F0F\u3002"'],  // 标准对话模式。
        ['"Uses Google conversational mixin."', '"\u4F7F\u7528 Google \u5BF9\u8BDD\u6DF7\u5165\u3002"'],  // 使用 Google 对话混入。
        ['"Uses custom mixin."', '"\u4F7F\u7528\u81EA\u5B9A\u4E49\u6DF7\u5165\u3002"'],  // 使用自定义混入。
        ['"You can prompt the model to try again or start a new conversation if the error persists."', '"\u60A8\u53EF\u4EE5\u91CD\u8BD5\u63D0\u793A\u6A21\u578B\uFF0C\u6216\u8005\u5982\u679C\u9519\u8BEF\u6301\u7EED\u5B58\u5728\uFF0C\u53EF\u4EE5\u5F00\u59CB\u65B0\u7684\u5BF9\u8BDD\u3002"'],  // 您可以重试提示模型，或者如果错误持续存在，可以开始新的对话。
        ['"for more help."', '"\u83B7\u53D6\u66F4\u591A\u5E2E\u52A9\u3002"'],  // 获取更多帮助。
    ];
}

function getWorkbenchReplacements() {
    return [
        // 0. Disable integrity check to prevent "Installation seems corrupt" warning
        ['this.f.checksums||{}', '{}||{}'],
        // 1. On/Off enum
        ['i.ON="On",i.OFF="Off"', 'i.ON="开",i.OFF="关"'],
        // 2. Tab labels
        ['label:"AI Shortcuts"', 'label:"AI 快捷键"'],
        // 3. Panel textContent
        ['textContent="Advanced Settings"', 'textContent="高级设置"'],
        ['textContent="Customizations"', 'textContent="自定义"'],
        ['textContent="Manage"', 'textContent="管理"'],
        ['textContent="Snooze"', 'textContent="暂停"'],
        ['textContent=o?"Cancel":"Start"', 'textContent=o?"取消":"开始"'],
        ['textContent="Manage MCP servers"', 'textContent="管理 MCP 服务器"'],
        ['textContent="View raw config"', 'textContent="查看原始配置"'],
        // 4. Security panel
        ['textContent="Terminal execution policy"', 'textContent="终端执行策略"'],
        ['textContent="Review policy"', 'textContent="审查策略"'],
        ['textContent="JavaScript execution policy"', 'textContent="JavaScript 执行策略"'],
        ['textContent="Always Proceed"', 'textContent="始终继续"'],
        ['textContent="Request Review"', 'textContent="请求审查"'],
        ['textContent="Agent Decides"', 'textContent="Agent 决定"'],
        ['textContent="Disabled"', 'textContent="已禁用"'],
        // 5. Setting labels
        ['label:"Agent Auto-Fix Lints"', 'label:"Agent 自动修复 Lint"'],
        ['label:"Auto Execution"', 'label:"自动执行"'],
        ['label:"Review Policy"', 'label:"审查策略"'],
        ['label:"Agent Gitignore Access"', 'label:"Agent Gitignore 访问"'],
        ['label:"Tab Gitignore Access"', 'label:"Tab Gitignore 访问"'],
        ['label:"Tab Speed"', 'label:"Tab 速度"'],
        ['label:"Tab to Jump"', 'label:"Tab 跳转"'],
        ['label:"Tab to Import"', 'label:"Tab 导入"'],
        ['label:"Auto-Open Edited Files"', 'label:"自动打开已编辑文件"'],
        ['label:"Open Agent on Reload"', 'label:"重新加载时打开 Agent"'],
        ['label:"Clipboard Context"', 'label:"剪贴板上下文"'],
        ['label:"Highlight After Accept"', 'label:"接受后高亮"'],
        ['label:"Suggestions in Editor"', 'label:"编辑器中的建议"'],
        ['label:"Enable Tab Sounds (Beta)"', 'label:"启用 Tab 声音 (Beta)"'],
        // 6. Setting descriptions
        ['description:["Set the speed of tab suggestions"]', 'description:["设置 Tab 建议的速度"]'],
        ['description:["Open files in the background if the agent creates or edits them"]', 'description:["当 Agent 创建或编辑文件时在后台打开它们"]'],
        ['description:["Open Agent panel on window reload"]', 'description:["窗口重新加载时打开 Agent 面板"]'],
        ['description:["Predict the location of your next edit and navigates you there with a tab keypress"]', 'description:["预测下一个编辑位置，按 Tab 键即可跳转到该位置"]'],
        ['description:["Quickly add and update imports with a tab keypress."]', 'description:["按 Tab 键快速添加和更新导入语句。"]'],
        ['description:["Highlight newly inserted text after accepting a Tab completion."]', 'description:["接受 Tab 补全后高亮新插入的文本。"]'],
        // 7. Review Policy dropdown
        ['{value:B5.TURBO,label:"Always Proceed",description:"Agent never asks for review. This maximizes the autonomy of the Agent, but also has the highest risk of the Agent operating over unsafe or injected Artifact content.",disabledInSecureMode:!0}',
            '{value:B5.TURBO,label:"始终继续",description:"Agent 从不请求审查。这最大化了 Agent 的自主性，但也具有 Agent 操作不安全或注入的 Artifact 内容的最高风险。",disabledInSecureMode:!0}'],
        ['{value:B5.AUTO,label:"Agent Decides",description:"Agent will decide when to ask for review based on task complexity and user preference."}',
            '{value:B5.AUTO,label:"Agent 决定",description:"Agent 将根据任务复杂性和用户偏好决定何时请求审查。"}'],
        ['{value:B5.ALWAYS,label:"Request Review",description:"Agent always asks for review.",disabledInSecureMode:!1}',
            '{value:B5.ALWAYS,label:"请求审查",description:"Agent 始终请求审查。",disabledInSecureMode:!1}'],
        // 8. Auto Execution dropdown
        ['{label:"Always Proceed",value:W1.EAGER,description:"Always auto-execute commands unless they are in your deny list. This also allows Agent to auto-execute Browser controls."}',
            '{label:"始终继续",value:W1.EAGER,description:"始终自动执行命令，除非它们在您的拒绝列表中。这也允许 Agent 自动执行浏览器控制。"}'],
        // 9. Tab Speed dropdown
        ['{label:"Slow",value:RV.SLOW}', '{label:"慢速",value:RV.SLOW}'],
        ['{label:"Fast",value:RV.FAST,isDefaultWhenAvailable:!0}', '{label:"快速",value:RV.FAST,isDefaultWhenAvailable:!0}'],
        // 10. Hover text
        ['"View and manage Agent memories, workflows, and rules"', '"查看和管理 Agent 记忆、工作流和规则"'],
        // 11. Accept / Add / Edit / Loading
        ['children:"Accept"', 'children:"接受"'],
        ['children:"Accept all"', 'children:"全部接受"'],
        ['children:"Add Model"', 'children:"添加模型"'],
        ['children:"Add context"', 'children:"添加上下文"'],
        ['children:"Add them to allow future interactions"', 'children:"将它们添加到允许列表以允许未来的交互"'],
        ['children:"Edit Model"', 'children:"编辑模型"'],
        ['children:"Edit rule"', 'children:"编辑规则"'],
        ['children:"Edit workflow"', 'children:"编辑工作流"'],
        ['children:"Edit your SSH configuration"', 'children:"编辑你的 SSH 配置"'],
        ['children:"Loading..."', 'children:"加载中..."'],
        ['children:"Loading MCP servers"', 'children:"正在加载 MCP 服务器"'],
        ['children:"Loading models..."', 'children:"正在加载模型..."'],
        ['children:"Loading Browser recording..."', 'children:"正在加载浏览器录制..."'],
        ['label:"Accept hunk"', 'label:"接受代码块"'],
        ['label:"Run"', 'label:"运行"'],
        ['label:"Running"', 'label:"运行中"'],
        ['label:"Open Agent"', 'label:"打开 Agent"'],
        ['label:"Reset to default"', 'label:"重置为默认"'],
        ['label:"Submit"', 'label:"提交"'],
        // === New: Start / Ask / Changes / Expand / Thought / Status ===
        ['children:["Start a New Conversation"', 'children:["开始新对话"'],
        ['"Ask anything, @ to mention, / for workflows"', '"输入任何内容，@ 用于提及，/ 用于调用工作流"'],
        ['`Changes Overview (${h})`', '`更改概览 (${h})`'],
        ['`Terminal (${d})`', '`终端 (${d})`'],
        ['text:l?"Collapse all":"Expand all"', 'text:l?"全部折叠":"全部展开"'],
        ['children:"Expand All"', 'children:"全部展开"'],
        ['children:"Collapse All"', 'children:"全部折叠"'],
        ['`Thinking for ${TTe(t)}`', '`思考中 ${TTe(t)}`'],
        ['`Thought for ${', '`思考了 ${'],
        ['children:"Thought Process"', 'children:"思考过程"'],
        ['"Auto-proceeded by the agent under your review policy."', '"已由 Agent 根据您的审查策略自动继续。"'],
        ['"Manually proceeded under your review policy."', '"已根据您的审查策略手动继续。"'],
        ['["Generating","Working","Loading", "Running"]', '["生成中","工作中","加载中", "运行中"]'],
        ['children:"Model"', 'children:"模型"'],
        ['children:["Proceed"', 'children:["继续"'],
        // === Batch 2: Agent Manager / Shortcuts / Settings / Artifacts / Audio / AI / Report ===
        ['"Open Agent Manager"', '"打开 Agent 管理器"'],
        ['`Open Agent Manager (${t})`', '`打开 Agent 管理器 (${t})`'],
        ['`View all ${this.w.nameShort} shortcuts`', '`查看所有 ${this.w.nameShort} 快捷键`'],
        ['label:"Settings"', 'label:"设置"'],
        ['title:"Editor-Specific Settings"', 'title:"编辑器特定设置"'],
        ['children:"Artifacts are files the agent creates during a conversation to help perform longer running tasks and allow the user to provide high-level feedback. Click to open in editor."',
            'children:"产物是 Agent 在对话中创建的文件，用于帮助执行较长时间运行的任务并允许用户提供高级反馈。点击在编辑器中打开。"'],
        ['children:"Artifact Name"', 'children:"产物名称"'],
        ['children:"Last Updated"', 'children:"最后更新"'],
        ['`Artifacts (${t.length} Files for Conversation)`', '`对话产物 (${t.length} 个文件)`'],
        ['children:"AI may make mistakes. Double-check all generated code."', 'children:"AI 可能会犯错。请仔细检查所有生成的代码。"'],
        ['children:"Send"', 'children:"发送"'],
        ['"Audio is not supported for this model"', '"该模型不支持音频"'],
        ['"No microphone detected"', '"未检测到麦克风"'],
        ['children:"1. Report Issue"', 'children:"1. 报告问题"'],
        ['children:"Report Issue"', 'children:"报告问题"'],
        ['children:"Get Logs"', 'children:"获取日志"'],
        ['"If you are having difficulty using "', '"如果你在使用 "'],
        ['", please report the issue using our feedback form."', '" 时遇到困难，请使用我们的反馈表单报告问题。"'],
        // === Batch 3: Comment / Reject / Accept Changes / Hide selection ===
        ['children:"Comment"', 'children:"评论"'],
        ['children:"Reject"', 'children:"拒绝"'],
        ['"Accept Changes"', '"接受更改"'],
        ['"Hide selection nudge"', '"隐藏选中操作提示"'],
        // === Batch 4: results 个结果 ===
        ['," result",s===1?"":"s"', '," 个结果"'],
        ['," result",i.resources.length===1?"":"s"', '," 个结果"'],
        ['," result",s.length===1?"":"s"," "', '," 个结果 "'],
    ];
}

// ═══════════════════════════════════════════════════════════════
// 补丁引擎
// ═══════════════════════════════════════════════════════════════

const PATCH_VERSION = 'v41';
const PATCH_MARKER = `/* zh-hans-patched-${PATCH_VERSION} */`;

function getPatchVersion(filepath) {
    try {
        const head = fs.readFileSync(filepath, { encoding: 'utf-8', flag: 'r' }).slice(0, 200);
        const m = head.match(/\/\* zh-hans-patched-(v\d+) \*\//);
        return m ? m[1] : (head.includes('/* zh-hans-patched */') ? 'v0' : null);
    } catch {
        return null;
    }
}

function isPatchCurrent(filepath) {
    return getPatchVersion(filepath) === PATCH_VERSION;
}

function patchFile(filepath, replacements, name) {
    if (!fs.existsSync(filepath)) {
        return { name, success: 0, total: replacements.length, error: '文件不存在' };
    }

    let content = fs.readFileSync(filepath, 'utf-8');

    // Remove old patch markers
    content = content.replace(/\/\* zh-hans-patched[^*]*\*\/\n?/, '');

    // Create backup (from clean content if no backup exists)
    const backup = filepath + '.bak';
    if (!fs.existsSync(backup)) {
        fs.writeFileSync(backup, content, 'utf-8');
    }

    let count = 0;
    const failed = [];

    for (const [oldStr, newStr] of replacements) {
        if (content.includes(oldStr)) {
            content = content.split(oldStr).join(newStr);
            count++;
        } else if (!content.includes(newStr)) {
            // Not found AND translation not already present
            failed.push(oldStr.substring(0, 50));
        } else {
            // Translation already present, count as success
            count++;
        }
    }

    // Add patch marker
    content = PATCH_MARKER + '\n' + content;
    fs.writeFileSync(filepath, content, 'utf-8');

    return { name, success: count, total: replacements.length, failed };
}

function revertFile(filepath) {
    const backup = filepath + '.bak';
    if (fs.existsSync(backup)) {
        fs.copyFileSync(backup, filepath);
        return true;
    }
    return false;
}

function updateChecksums(base) {
    const productJsonPath = path.join(base, 'product.json');
    if (!fs.existsSync(productJsonPath)) return 0;

    // Backup original product.json (only once)
    const backup = productJsonPath + '.bak';
    if (!fs.existsSync(backup)) {
        fs.copyFileSync(productJsonPath, backup);
    }

    const raw = fs.readFileSync(productJsonPath, 'utf-8');
    const product = JSON.parse(raw);

    // Clear checksums entirely to prevent integrity check failures.
    // Antigravity checks these checksums on startup BEFORE extensions load,
    // so recalculating hashes doesn't help — we must remove them.
    if (product.checksums && Object.keys(product.checksums).length > 0) {
        product.checksums = {};
        fs.writeFileSync(productJsonPath, JSON.stringify(product, null, '\t'), 'utf-8');
        return 1;
    }

    return 0;
}

function revertChecksums(base) {
    const backup = path.join(base, 'product.json.bak');
    const target = path.join(base, 'product.json');
    if (fs.existsSync(backup)) {
        fs.copyFileSync(backup, target);
        return true;
    }
    return false;
}

// ═══════════════════════════════════════════════════════════════
// 插件激活 / 命令
// ═══════════════════════════════════════════════════════════════

function applyAllPatches(silent) {
    const base = getAppBase();
    if (!base) {
        if (!silent) vscode.window.showErrorMessage('未找到 Antigravity 安装目录');
        return false;
    }

    const targets = getTargets(base);
    const results = [];

    // Check if all files have current patch version
    const allCurrent = Object.values(targets).every(f => isPatchCurrent(f));
    if (allCurrent) {
        if (!silent) vscode.window.showInformationMessage('汉化补丁已是最新状态');
        return true;
    }

    // Revert files that have old patches before re-applying
    for (const filepath of Object.values(targets)) {
        const ver = getPatchVersion(filepath);
        if (ver && ver !== PATCH_VERSION) {
            revertFile(filepath);
        }
    }

    // Apply patches
    results.push(patchFile(targets.settings, getSettingsReplacements(), 'Settings'));
    results.push(patchFile(targets.chat, getChatReplacements(), 'Chat'));
    results.push(patchFile(targets.workbench, getWorkbenchReplacements(), 'Workbench'));

    // Update checksums
    const checksumCount = updateChecksums(base);

    const totalSuccess = results.reduce((s, r) => s + r.success, 0);
    const totalAll = results.reduce((s, r) => s + r.total, 0);

    const detail = results.map(r => `${r.name}: ${r.success}/${r.total}`).join(' | ');

    if (!silent) {
        vscode.window.showInformationMessage(
            `汉化补丁已应用！共 ${totalSuccess} 处 (${detail})。请重启 Antigravity 生效。`,
            '重新加载窗口'
        ).then(choice => {
            if (choice === '重新加载窗口') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });
    }

    return true;
}

function revertAllPatches() {
    const base = getAppBase();
    if (!base) {
        vscode.window.showErrorMessage('未找到 Antigravity 安装目录');
        return;
    }

    const targets = getTargets(base);
    let reverted = 0;

    for (const filepath of Object.values(targets)) {
        if (revertFile(filepath)) reverted++;
    }

    revertChecksums(base);

    vscode.window.showInformationMessage(
        `已恢复 ${reverted} 个文件。请重启 Antigravity 生效。`,
        '重新加载窗口'
    ).then(choice => {
        if (choice === '重新加载窗口') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    });
}

function activate(context) {
    // 注册命令
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity-zh.applyPatch', () => applyAllPatches(false)),
        vscode.commands.registerCommand('antigravity-zh.revertPatch', () => revertAllPatches())
    );

    // 启动时自动检测并应用
    setTimeout(() => {
        try {
            applyAllPatches(true);
        } catch (e) {
            console.error('[antigravity-zh] 自动补丁失败:', e);
        }
    }, 3000);
}

function deactivate() { }

module.exports = { activate, deactivate };
