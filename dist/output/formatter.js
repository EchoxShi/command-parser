import chalk from 'chalk';
export function formatOutput(result, showExplanation) {
    console.log();
    // Warning for dangerous commands
    if (result.isDangerous || result.warning) {
        console.log(chalk.bgYellow.black(' ⚠ WARNING '));
        console.log(chalk.yellow(result.warning || 'This command may be destructive. Review carefully before running.'));
        console.log();
    }
    // Command output (highlighted)
    console.log(chalk.dim('Command:'));
    console.log(chalk.cyan.bold(`  ${result.command}`));
    console.log();
    // Explanation
    if (showExplanation && result.explanation) {
        console.log(chalk.dim('Explanation:'));
        console.log(chalk.white(`  ${result.explanation}`));
        console.log();
    }
}
