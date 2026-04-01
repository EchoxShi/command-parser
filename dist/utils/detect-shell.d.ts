import type { ShellType } from '../llm/types.js';
/**
 * 检测当前操作系统和终端环境，返回最合适的 shell 类型
 */
export declare function detectShell(): ShellType;
/**
 * 获取平台友好名称
 */
export declare function getPlatformName(): string;
