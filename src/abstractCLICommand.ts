import {Arguments, Argv, CommandModule} from "yargs";
import {IBaseCLIArgs, IPendingPromise} from "./cli";
import {CLILogger} from "./cliLogger";

type ExecutionPhase = 'pre' | 'main' | 'post';

/**
 * Abstract CLI command construct <br/>
 * Extend this class to write your own commands
 */
abstract class AbstractCLICommand {
    protected args: Arguments | undefined;

    /**
     * The CLI run logger
     */
    protected readonly cliLogger: CLILogger;
    /**
     * The completion promise to invoke when done
     */
    protected readonly completionPromise: IPendingPromise;

    /**
     * Automatically called by {@link CLI.runFromArgs}
     * @param cliLogger The initialized logger for the CLI
     * @param completionPromise A promise to be resolved once the command completes / fails
     * @internal
     */
    public constructor(cliLogger: CLILogger, completionPromise: IPendingPromise) {
        this.cliLogger = cliLogger;
        this.completionPromise = completionPromise;
    }

    /**
     * Automatically called by {@link CLI.runFromArgs} <br/>
     * Returns as yargs compliant command facade
     * @returns A standard [yargs command module](https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module)
     * @internal
     */
    public toYargsCommand(): CommandModule {
        return {
            aliases: this.aliases,
            builder: (args: Argv) => this.buildCommandArgs(args),
            command: this.command,
            describe: this.describe,
            handler: async (args: Arguments<{}>) => {
                this.args = args;
                let phase: ExecutionPhase = 'pre';
                this.cliLogger.log(`Executing CLI command: ${this.command}`);
                const {_, $0, ...argsToReport} = args as IBaseCLIArgs;
                const argsReport = this.getArgsReport(argsToReport as IBaseCLIArgs);
                if (argsReport !== undefined) this.cliLogger.debug(`  Command arguments: ${argsReport}`);

                try {
                    await this.preCommand();
                    phase = 'main';
                    const result = await this.handleCommand(args as IBaseCLIArgs);
                    phase = 'post';
                    await this.postCommand(phase);
                    this.completionPromise.finishedOK(result);
                } catch (e) {
                    try {
                        if (phase !== "post") await this.postCommand(phase, e);
                    } finally {
                        this.completionPromise.finishedError(e);
                    }
                }
            }

        };
    }

    /**
     * The command name (this is the way to invoke it)
     */
    protected abstract command: string;

    /**
     * Command alias/es if applicable (alternative ways to invoke it)
     */
    protected aliases: string | string[] = [];

    /**
     * Command help text description
     */
    protected describe: string | false | undefined;

    /**
     * Command specific parameter parsing
     * @param args The shared command args from {@link CLI.addSharedOptions} as passed from {@link CLI.runFromArgs}
     */
    protected abstract buildCommandArgs(args: Argv): Argv;

    /**
     * The actual command execution
     * @param args The final command args from {@link buildCommandArgs}
     * @returns The command result (will be propagated via {@see completionPromise})
     */
    protected async abstract handleCommand(args: IBaseCLIArgs): Promise<any>;

    /**
     * Produces a string representation of the command arguments to be logged
     * WARNING - if not overridden and adjusted, this may leak confidential data to the logs
     * @param args The command parsed args
     * @returns The string to report (return undefined to skip the report)
     */
    protected getArgsReport(args: IBaseCLIArgs): string | undefined {
        return JSON.stringify(args);
    }

    /**
     * Run pre-command setup
     * Thrown errors will skip main command execution and fail the command
     */
    protected async preCommand() {
        return;
    }

    /**
     * Run post-command teardown
     * Will be called even if pre-command throws and the main command execution is skipped
     * Thrown errors will fail the command
     * @param executionPhase The current execution phase
     * @param executionError The error thrown by the command (if applicable)
     */
    protected async postCommand(executionPhase: ExecutionPhase, executionError?: Error) {
        return;
    }

}


export {AbstractCLICommand, Argv};
