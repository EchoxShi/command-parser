import type { ShellType } from '../llm/types.js';

/**
 * 检测当前操作系统和终端环境，返回最合适的 shell 类型
 */
export function detectShell(): ShellType {
  const platform = process.platform;

  // macOS 或 Linux 默认用 bash
  if (platform === 'darwin' || platform === 'linux') {
    // 检查是否在 zsh 环境（macOS 默认）
    const shell = process.env.SHELL || '';
    if (shell.includes('zsh')) {
      return 'bash'; // zsh 语法基本兼容 bash
    }
    return 'bash';
  }

  // Windows 环境
  if (platform === 'win32') {
    // 检测是否在 Git Bash / MSYS / Cygwin 环境
    if (process.env.MSYSTEM || process.env.TERM === 'cygwin') {
      return 'bash';
    }

    // 检测是否在 WSL 环境
    if (process.env.WSL_DISTRO_NAME) {
      return 'bash';
    }

    // 检测 PowerShell 环境变量
    // PSModulePath 是 PowerShell 特有的环境变量
    if (process.env.PSModulePath) {
      return 'powershell';
    }

    // 检测 ComSpec 来判断 CMD
    const comspec = process.env.ComSpec || '';
    if (comspec.toLowerCase().includes('cmd.exe')) {
      // 但如果有 PSModulePath，说明是从 PowerShell 启动的
      return 'powershell'; // Windows 默认推荐 PowerShell
    }

    // Windows 默认用 PowerShell
    return 'powershell';
  }

  // 其他平台默认 bash
  return 'bash';
}

/**
 * 获取平台友好名称
 */
export function getPlatformName(): string {
  const platform = process.platform;
  if (platform === 'darwin') return 'macOS';
  if (platform === 'linux') return 'Linux';
  if (platform === 'win32') return 'Windows';
  return platform;
}
