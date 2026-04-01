import OpenAI from 'openai';
import { buildSystemPrompt, buildUserPrompt } from './prompts.js';
import { getDetailedPlatform } from '../utils/detect-shell.js';
import type { CommandResult, ShellType } from './types.js';

const DANGEROUS_PATTERNS: Record<ShellType, RegExp[]> = {
  powershell: [
    /Remove-Item.*-Recurse.*-Force/i,
    /Format-Volume/i,
    /Clear-Disk/i,
    /Stop-Process.*-Force/i,
    /Remove-Item.*\$env:/i,
    /rm\s+-rf/i
  ],
  cmd: [
    /del\s+\/s\s+\/q/i,
    /format\s+[a-z]:/i,
    /rmdir\s+\/s\s+\/q/i,
    /rd\s+\/s\s+\/q/i
  ],
  bash: [
    /rm\s+-rf\s+\//,
    /rm\s+-rf\s+\*/,
    /mkfs\./,
    /dd\s+if=.*of=\/dev/,
    /:\(\)\{:\|:&\};:/
  ]
};

function detectDangerousCommand(command: string, shell: ShellType): boolean {
  const patterns = DANGEROUS_PATTERNS[shell] || [];
  return patterns.some(pattern => pattern.test(command));
}

function parseResponse(text: string): Omit<CommandResult, 'isDangerous'> {
  // Remove markdown code block if present
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(cleanText);
    return {
      command: parsed.command || cleanText,
      explanation: parsed.explanation || '',
      warning: parsed.warning
    };
  } catch {
    // If not JSON, treat as plain text command
    return {
      command: cleanText,
      explanation: ''
    };
  }
}

export async function generateCommand(
  query: string,
  shell: ShellType,
  apiKey: string,
  baseUrl?: string,
  model?: string
): Promise<CommandResult> {
  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  });

  const response = await client.chat.completions.create({
    model: model || 'qwen-turbo',
    max_tokens: 512,
    messages: [
      { role: 'system', content: buildSystemPrompt(shell, getDetailedPlatform()) },
      { role: 'user', content: buildUserPrompt(query) }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from API');
  }

  const result = parseResponse(content);
  const isDangerous = detectDangerousCommand(result.command, shell);

  return {
    ...result,
    isDangerous
  };
}
