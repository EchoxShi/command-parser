export interface CommandResult {
    command: string;
    explanation: string;
    warning?: string;
    isDangerous: boolean;
}
export type ShellType = 'powershell' | 'cmd' | 'bash';
