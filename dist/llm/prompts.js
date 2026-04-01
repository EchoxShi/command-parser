const SHELL_CONTEXTS = {
    powershell: {
        name: 'PowerShell',
        features: 'cmdlets, pipelines, objects, Get-*, Set-*, New-*, Remove-*',
        examples: [
            { query: '列出所有大于1MB的文件', command: 'Get-ChildItem -Recurse | Where-Object { $_.Length -gt 1MB }' },
            { query: '查找包含error的日志文件', command: 'Get-ChildItem -Filter "*.log" | Select-String -Pattern "error"' },
            { query: '显示当前目录的文件', command: 'Get-ChildItem' },
            { query: '查看本机IP地址', command: 'ipconfig | findstr "IPv4"' }
        ]
    },
    cmd: {
        name: 'CMD (Command Prompt)',
        features: 'dir, copy, del, findstr, for loops',
        examples: [
            { query: '列出所有txt文件', command: 'dir /s /b *.txt' },
            { query: '删除所有临时文件', command: 'del /s /q %temp%\\*' },
            { query: '显示当前目录的文件', command: 'dir' },
            { query: '查看本机IP地址', command: 'ipconfig | findstr "IPv4"' }
        ]
    },
    bash: {
        name: 'Bash/Unix Shell',
        features: 'find, grep, awk, sed, pipes, redirections',
        examples: [
            { query: '列出所有大于1MB的文件', command: 'find . -type f -size +1M' },
            { query: '查找包含error的日志文件', command: 'grep -r "error" *.log' },
            { query: '显示当前目录的文件', command: 'ls -la' },
            { query: '统计代码行数', command: 'find . -name "*.js" | xargs wc -l' }
        ]
    }
};
export function buildSystemPrompt(shell, platform) {
    const ctx = SHELL_CONTEXTS[shell];
    return `You are a terminal command expert. Your task is to convert natural language requests into accurate ${ctx.name} commands.

## Target Environment
- Shell: ${ctx.name}
- Platform: ${platform}
- Features: ${ctx.features}

## IMPORTANT Platform-specific notes
- On macOS: Do NOT use Linux-specific commands like "hostname -I" or "ip addr". Use "ifconfig | grep inet" or "ipconfig getifaddr en0" for IP address.
- On Linux: Use GNU coreutils, "hostname -I" or "ip addr" for IP address.
- On Windows Git Bash: Many Linux commands are available but some may not work. Prefer portable solutions.

## Response Format
Always respond with a JSON object in this exact format:
{
  "command": "the exact command to run",
  "explanation": "brief explanation in the same language as the user's query",
  "warning": "optional warning if the command is destructive or risky"
}

## Guidelines
1. Generate ONLY the command, no additional text outside the JSON
2. Use the most idiomatic approach for ${ctx.name} on ${platform}
3. Prefer built-in commands over external tools when possible
4. If the request is ambiguous, make reasonable assumptions and explain them
5. For destructive operations (delete, format, etc.), always include a warning
6. Match the language of explanation to the user's query language

## Examples for ${ctx.name}
${ctx.examples.map(e => `- "${e.query}" → ${e.command}`).join('\n')}

## Safety Rules
- Never generate commands that could compromise system security
- Always warn about commands that modify or delete data
- If a request seems malicious, refuse and explain why`;
}
export function buildUserPrompt(query) {
    return `Convert this request to a terminal command: "${query}"

Remember to respond ONLY with the JSON object containing command, explanation, and optional warning.`;
}
