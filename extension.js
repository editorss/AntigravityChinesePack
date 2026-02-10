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
        ['"Ask anything, @ to mention, / for workflows"', '"随便问，@ 提及，/ 调用工作流"'],
        ['`Changes Overview (${d})`', '`更改概览 (${d})`'],
        ['text:l?"Collapse all":"Expand all"', 'text:l?"全部折叠":"全部展开"'],
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
        ['children:"Exit code"', 'children:"退出码"'],
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
        ['inputPlaceholder:i="Ask anything, @ to mention, / for workflows"', 'inputPlaceholder:i="随便问，@ 提及，/ 调用工作流"'],
        ['placeholder??"Ask anything - use \'@\' to mention code blocks"', 'placeholder??"随便问 - 用 \'@\' 提及代码块"'],
        ['`Ask anything (${r?"⌘L":"Ctrl+L"}), @ to mention, / for workflows`', '`随便问 (${r?"⌘L":"Ctrl+L"})，@ 提及，/ 调用工作流`'],
        ['`Changes Overview (${d})`', '`更改概览 (${d})`'],
        ['`Terminal (${d})`', '`终端 (${d})`'],
        ['`Artifacts (${d})`', '`产物 (${d})`'],
        ['text:l?"Collapse all":"Expand all"', 'text:l?"全部折叠":"全部展开"'],
        ['children:"Expand All"', 'children:"全部展开"'],
        ['children:"Collapse All"', 'children:"全部折叠"'],
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
        ['"Ask anything, @ to mention, / for workflows"', '"随便问，@ 提及，/ 调用工作流"'],
        ['`Changes Overview (${h})`', '`更改概览 (${h})`'],
        ['text:l?"Collapse all":"Expand all"', 'text:l?"全部折叠":"全部展开"'],
        ['children:"Expand All"', 'children:"全部展开"'],
        ['children:"Collapse All"', 'children:"全部折叠"'],
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
        ['`Artifacts (${t.length} Files for Conversation)`', '`产物 (${t.length} 个对话文件)`'],
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

const PATCH_VERSION = 'v24';
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
