import type { CommandResult, ShellType } from './types.js';
export declare function generateCommand(query: string, shell: ShellType, apiKey: string, baseUrl?: string, model?: string): Promise<CommandResult>;
