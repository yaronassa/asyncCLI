const {execSync} = require('child_process');
const fs = require('fs');

class GITHooksProcessor {
    public async runFromArgs() {
        const hook = process.argv[process.argv.length - 1];
        await this.processGitHook(hook);
    }

    public async processGitHook(hookName: string) {

        switch (hookName) {
            case 'preCommit':
                await this.processPreCommit();
                break;

            default:
                throw new Error(`Unsupported hook: ${hookName}`);
        }
    }

    private async processPreCommit() {

        const filesToInspect: string[] = execSync('git diff --cached --name-only').toString()
            .split('\n').filter((fileName: string) => fileName.trim() !== '');

        this.checkForbiddenFiles(filesToInspect);
        this.checkLintFiles(filesToInspect);
        this.checkForbiddenStrings(filesToInspect);

        execSync('npm test');
    }



    private checkForbiddenFiles(filesToInspect: string[]) {
        const forbiddenFilesMatchers = [/^.+[Cc]redentials.+\.json$/];
        const forbiddenFiles = filesToInspect.filter(file => forbiddenFilesMatchers.some(matcher => matcher.test(file)));
        if (forbiddenFiles.length > 0) throw new Error(`Commit includes forbidden files: ${forbiddenFiles.join(', ')}`);
    }

    private checkLintFiles(filesToInspect: string[]) {
        const lintFiles = filesToInspect.filter(file => file.endsWith('.ts'));
        if (lintFiles.length > 0) execSync(`./node_modules/.bin/tslint ${lintFiles.join(' ')}`);
    }

    private checkForbiddenStrings(filesToInspect: string[]) {
        const forbiddenTextMatchers = [/no_?commit/i];
        const filesWithForbiddenText = filesToInspect.filter(file =>
            forbiddenTextMatchers.some(matcher => matcher.test(fs.readFileSync(file).toString()))
        );
        if (filesWithForbiddenText.length > 0) throw new Error(`Commit includes forbidden texts in: ${filesWithForbiddenText.join(', ')}`);
    }
}

export {GITHooksProcessor};

if (require.main === module) {
    const processor = new GITHooksProcessor();
    processor.runFromArgs()
        .then(() => {
            // tslint:disable:no-console
            console.log('Git hook processed');
            process.exit(0);
        })
        .catch(e => {
            // tslint:disable:no-console
            console.error(`Error processing git hook : ${e.message}`);
            process.exit(1);
        });
}
