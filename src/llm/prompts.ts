import type { ShellType } from './types.js';

interface ShellContext {
  name: string;
  features: string;
  examples: { query: string; command: string }[];
}

const SHELL_CONTEXTS: Record<ShellType, ShellContext> = {
  powershell: {
    name: 'PowerShell',
    features: 'cmdlets, pipelines, objects, Get-*, Set-*, New-*, Remove-*',
    examples: [
      { query: '列出所有大于1MB的文件', command: 'Get-ChildItem -Recurse | Where-Object { $_.Length -gt 1MB }' },
      { query: '查找包含error的日志文件', command: 'Get-ChildItem -Filter "*.log" | Select-String -Pattern "error"' },
      { query: '显示当前目录的文件', command: 'Get-ChildItem' },
      { query: '查看系统内存使用', command: 'Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, @{N="Memory(MB)";E={[math]::Round($_.WorkingSet64/1MB,2)}}' }
    ]
  },
  cmd: {
    name: 'CMD (Command Prompt)',
    features: 'dir, copy, del, findstr, for loops',
    examples: [
      { query: '列出所有txt文件', command: 'dir /s /b *.txt' },
      { query: '删除所有临时文件', command: 'del /s /q %temp%\\*' },
      { query: '显示当前目录的文件', command: 'dir' },
      { query: '查找包含error的文件', command: 'findstr /s /i "error" *.log' }
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

export function buildSystemPrompt(shell: ShellType): string {
  const ctx = SHELL_CONTEXTS[shell];

  return `You are a terminal command expert. Your task is to convert natural language requests into accurate ${ctx.name} commands.

## Target Environment
- Shell: ${ctx.name}
- Platform: ${shell === 'bash' ? 'Unix/Linux/macOS' : 'Windows'}
- Features: ${ctx.features}

## Response Format
Always respond with a JSON object in this exact format:
{
  "command": "the exact command to run",
  "explanation": "brief explanation in the same language as the user's query",
  "warning": "optional warning if the command is destructive or risky"
}

## Guidelines
1. Generate ONLY the command, no additional text outside the JSON
2. Use the most idiomatic approach for ${ctx.name}
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

export function buildUserPrompt(query: string): string {
  return `Convert this request to a terminal command: "${query}"

Remember to respond ONLY with the JSON object containing command, explanation, and optional warning.`;
}
