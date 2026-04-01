import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import clipboard from 'clipboardy';
import { spawn } from 'child_process';
import { generateCommand } from './llm/client.js';
import { configStore } from './config/store.js';
import { formatOutput } from './output/formatter.js';
import { detectShell, getPlatformName } from './utils/detect-shell.js';
// Wait for single keypress
function waitForKey() {
    return new Promise((resolve) => {
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        process.stdin.resume();
        process.stdin.once('data', (data) => {
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
            }
            process.stdin.pause();
            resolve(data.toString());
        });
    });
}
// Execute command in shell
function executeCommand(command, shell) {
    console.log(chalk.dim('\nExecuting...\n'));
    const shellCmd = shell === 'powershell' ? 'powershell' : shell === 'cmd' ? 'cmd' : 'bash';
    const shellArgs = shell === 'powershell' ? ['-Command', command]
        : shell === 'cmd' ? ['/c', command]
            : ['-c', command];
    const child = spawn(shellCmd, shellArgs, { stdio: 'inherit' });
    child.on('close', (code) => {
        process.exit(code || 0);
    });
}
// Get current shell setting, auto-detect if not set
function getShell(optionShell) {
    // If user specified -s option, use that
    if (optionShell && ['powershell', 'cmd', 'bash'].includes(optionShell)) {
        return optionShell;
    }
    // Check if we have a saved shell preference
    const savedShell = configStore.get('defaultShell');
    if (savedShell && ['powershell', 'cmd', 'bash'].includes(savedShell)) {
        return savedShell;
    }
    // Auto-detect and save for next time
    const detected = detectShell();
    configStore.set('defaultShell', detected);
    configStore.set('shellDetected', true);
    console.log(chalk.dim(`检测到 ${getPlatformName()} 平台，默认使用 ${detected}`));
    console.log(chalk.dim(`如需更改: nlc config --set-shell <powershell|cmd|bash>\n`));
    return detected;
}
const program = new Command();
program
    .name('nlc')
    .description('Natural language to terminal commands')
    .version('1.0.0', '-v, --version', 'output the version number');
// Main command: generate command
program
    .argument('[query]', 'Natural language description of the command')
    .option('-s, --shell <type>', 'Target shell (powershell, cmd, bash)')
    .option('-y, --yes', 'Skip interactive prompt, just show command')
    .option('--no-explain', 'Skip command explanation')
    .action(async (query, options) => {
    // If no query, show help
    if (!query) {
        program.help();
        return;
    }
    const apiKey = configStore.get('apiKey');
    if (!apiKey) {
        console.error(chalk.red('API Key not configured.'));
        console.log(chalk.dim('Run: nlc config --set-key <your-qwen-api-key>'));
        console.log(chalk.dim('Get key from: https://bailian.console.aliyun.com/'));
        process.exit(1);
    }
    // Get shell (auto-detect if needed)
    const shell = getShell(options.shell);
    const spinner = ora('Generating command...').start();
    try {
        const baseUrl = configStore.get('baseUrl');
        const model = configStore.get('model');
        const result = await generateCommand(query, shell, apiKey, baseUrl || undefined, model || undefined);
        spinner.stop();
        formatOutput(result, options.explain);
        // Skip interactive if -y flag
        if (options.yes) {
            return;
        }
        // Show action prompt
        console.log(chalk.dim('─'.repeat(40)));
        console.log(`  ${chalk.bgCyan.black(' C ')} 复制  ${chalk.bgGreen.black(' X ')} 执行  ${chalk.bgGray.white(' Enter ')} 退出`);
        console.log();
        // Wait for keypress
        const key = await waitForKey();
        const keyLower = key.toLowerCase();
        if (keyLower === 'c') {
            await clipboard.write(result.command);
            console.log(chalk.green('✓ 已复制到剪贴板!'));
        }
        else if (keyLower === 'x') {
            if (result.isDangerous) {
                console.log(chalk.yellow('⚠ 危险命令，请按 Y 确认执行，其他键取消'));
                const confirm = await waitForKey();
                if (confirm.toLowerCase() !== 'y') {
                    console.log(chalk.dim('已取消'));
                    return;
                }
            }
            executeCommand(result.command, shell);
            return; // Don't exit, let executeCommand handle it
        }
        else if (key === '\r' || key === '\n' || key === '\x1b') {
            // Enter or Escape - exit
        }
    }
    catch (error) {
        spinner.fail('Failed to generate command');
        if (error instanceof Error) {
            console.error(chalk.red(error.message));
        }
        process.exit(1);
    }
});
// Config subcommand
program
    .command('config')
    .description('Manage CLI configuration')
    .option('--set-key <key>', 'Set API key')
    .option('--set-url <url>', 'Set API base URL')
    .option('--set-model <model>', 'Set model name')
    .option('--set-shell <shell>', 'Set default shell (powershell, cmd, bash)')
    .option('--show', 'Show current configuration')
    .option('--clear', 'Clear all configuration')
    .action((options) => {
    if (options.setKey) {
        configStore.set('apiKey', options.setKey);
        console.log(chalk.green('API key saved!'));
        return;
    }
    if (options.setUrl) {
        configStore.set('baseUrl', options.setUrl);
        console.log(chalk.green('Base URL saved!'));
        return;
    }
    if (options.setModel) {
        configStore.set('model', options.setModel);
        console.log(chalk.green('Model saved!'));
        return;
    }
    if (options.setShell) {
        if (!['powershell', 'cmd', 'bash'].includes(options.setShell)) {
            console.error(chalk.red('Invalid shell. Use: powershell, cmd, or bash'));
            return;
        }
        configStore.set('defaultShell', options.setShell);
        configStore.set('shellDetected', true);
        console.log(chalk.green(`Default shell set to: ${options.setShell}`));
        return;
    }
    if (options.show) {
        const key = configStore.get('apiKey');
        const url = configStore.get('baseUrl');
        const model = configStore.get('model');
        const shell = configStore.get('defaultShell');
        const detected = configStore.get('shellDetected');
        console.log(`API Key: ${key ? '***' + key.slice(-4) : chalk.dim('Not set')}`);
        console.log(`Base URL: ${url || chalk.dim('Default (Qwen)')}`);
        console.log(`Model: ${model || 'qwen-turbo'}`);
        console.log(`Shell: ${shell || chalk.dim('Auto-detect')}${detected ? '' : chalk.dim(' (will detect on first run)')}`);
        console.log(`Platform: ${getPlatformName()}`);
        return;
    }
    if (options.clear) {
        configStore.clear();
        console.log(chalk.yellow('Configuration cleared.'));
        return;
    }
    console.log('Usage: nlc config [options]');
    console.log('');
    console.log('Options:');
    console.log('  --set-key <key>     Set API key');
    console.log('  --set-url <url>     Set API base URL');
    console.log('  --set-model <model> Set model name');
    console.log('  --set-shell <shell> Set default shell (powershell, cmd, bash)');
    console.log('  --show              Show current configuration');
    console.log('  --clear             Clear all configuration');
});
export { program };
