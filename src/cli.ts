import {CLILogger, ICLILogger, ICLILoggerOptions, isOverrideLogger} from "./cliLogger";
import {AbstractCLICommand} from "./abstractCLICommand";
import {Arguments, Argv} from "yargs";
import {cliRunFullID} from "./cliRunID";

/**
 * Shared CLI arguments<br/>
 * Extend these to add your own shared arguments
 */
interface IBaseCLIArgs extends Arguments {
    /**
     * Optional JSON file to load arguments from
     */
    settingsFile?: string
}

/**
 * A completion promise used wait for async commands
 */
interface IPendingPromise {
    /** Resolves the promise */
    finishedOK: (res?: any) => void,
    /** Rejects the promise */
    finishedError: (e: Error) => void,
    /** The pending promise */
    resultPromise: Promise<any>
}

/**
 * CLI initialization options
 */
interface ICLIInitOptions {
    /**
     * Where to load CLI commands from
     * @default './src/cliCommands'
     */
    commandsDir: string,
    /**
     * A cli logger configuration object <strong>OR</strong> a complete override implementation of the logger
     */
    loggerConfiguration: Partial<ICLILoggerOptions> | {
        /**
         * Override the built in logger completely with your own object
         */
        overrideLogger: ICLILogger
    }
}
/** @ignore */
const path = require('path');
/** @ignore */
const fs = require('fs');

/**
 * The CLI <br/>
 * Extend this to add functionality and customization
 */
class CLI {

    /**
     * The unique run ID this CLI is executing <br/>
     * A process can have only one CLI execution at a time
     */
    public get runID(): string {
        return cliRunFullID;
    }

    /**
     * The logger to be used by this CLI
     */
    protected cliLogger!: ICLILogger;
    /**
     * The initialization options for this CLI
     */
    protected readonly cliInitOptions: ICLIInitOptions;

    /**
     * Provide cli arguments via a json settings file <br/>
     * Called automatically by {@link runFromArgs}
     * @param args The pre-parsed arguments object
     * @internal
     */
    protected loadSettingsFile(args: Arguments<{settingsFile?: string}>) {
        if (args.settingsFile === undefined) return args;

        try {
            const settings = require(path.resolve(args.settingsFile));
            this.cliLogger.debug(`Loaded settings file from ${args.settingsFile}. ${Object.keys(settings).length} settings were loaded.`);
            return Object.assign(args, settings);
        } catch (e) {
            throw new Error(`Cannot load settings file ${args.settingsFile}: ${e.message}`);
        }
    }

    /**
     * @param userCLIInitOptions The initialization options for this CLI
     */
    constructor(userCLIInitOptions: Partial<ICLIInitOptions> = {}) {
        this.cliInitOptions = this.getInitOptions(userCLIInitOptions);
        this.initLogger();
    }

    /**
     * Execute the CLI for a given set of arguments
     * @param args A preprocessed set of arguments or the process run arguments
     */
    public async runFromArgs(args: string[] = process.argv.slice(2)): Promise<any> {
        this.cliLogger.log('Initializing CLI...');

        const parser = require('yargs');
        parser.parserConfiguration({'strip-aliased': true, 'strip-dashed': true});

        const completion = this.getPendingPromise();

        const commands = await this.getCommands(completion);

        const commandNames: string[] = [];

        commands.forEach(command => {
            const commandYargsFacade = command.toYargsCommand();
            parser.command(commandYargsFacade);
            commandNames.push(commandYargsFacade.command as string);
        });
        this.cliLogger.log(`Loaded ${commands.length} commands to CLI: ${commandNames.join(", ")}`);

        parser
            .help(false)
            .scriptName('npm start --')
            .version(false)
            .env('CLI')
            .middleware([this.loadSettingsFile.bind(this)])
            .option('settingsFile', {
                describe: 'Load settings from this file (you can still override them with the command line parameters)'
            })
            .demandCommand(1, 1, "Must specify a single command (e.g. npm start -- <Command> <Arguments>)");

        this.addSharedOptions(parser)
            .parse(args);

        try {
            const result = await completion.resultPromise;

            return result;
        } catch (e) {
            this.cliLogger.error(e.message);
            throw e;
        } finally {
            await CLILogger.closeLogger();
        }
    }

    /**
     * Override this to add shared args, options, middleware, or modify yargs parser configuration <br/>
     * (you can do almost anything specified in [yargs API](https://github.com/yargs/yargs/blob/master/docs/api.md)
     * @param args The current args
     * @returns The updated args
     */
    protected addSharedOptions(args: Argv): Argv {
        return args;
    }

    /**
     * Returns a list of command file paths to load to the parser <br/>
     * Defaults to .ts/.js files in the {@link cliInitOptions.commandsDir} path (excluding ones starting with `abstract`) <br/>
     * Override this to implement your own filtering scheme
     */
    protected getCommandFilesPaths(): string[] {
        const commandsPath = path.resolve(this.cliInitOptions.commandsDir);
        if (!fs.existsSync(commandsPath)) throw new Error(`Cannot locate given commandsDir: ${this.cliInitOptions.commandsDir}`);

        const commandFiles = fs.readdirSync(commandsPath)
            .filter((file: string) => file.match(/\.(?:ts|js)$/))
            .filter((file: string) => !file.startsWith("abstract"))
            .map((file: string) => path.resolve(commandsPath, file));

        return commandFiles;
    }

    /**
     * Loads the command modules from disk <br/>
     * @param completion The run completion promise to be passed to the commands
     * @returns The initialized command objects
     */
    private async getCommands(completion: IPendingPromise): Promise<AbstractCLICommand[]> {
        const commandFilePaths = this.getCommandFilesPaths();

        return Promise.all(commandFilePaths.map(async (commandFilePath: string) => {
            // tslint:disable-next-line:variable-name
            let CLICommand: {default: new (logger: ICLILogger, completionPromise: IPendingPromise) => AbstractCLICommand};
            try {
                CLICommand = await import(commandFilePath);
            } catch (e) {
                throw new Error(`Cannot load command file ${path.basename(commandFilePath)}: ${e.message}\n(does it has a default export?)`);
            }

            return new CLICommand.default(this.cliLogger, completion) as AbstractCLICommand;
        }));
    }

    /**
     * Builds the full init options from the user's partial options and the default options
     * @param userInitOptions The user's partial options
     * @returns The full init options
     */
    private getInitOptions(userInitOptions: Partial<ICLIInitOptions>): ICLIInitOptions {
        const defaultInitOptions: ICLIInitOptions = {
            commandsDir: './src/cliCommands',
            loggerConfiguration: {
                createLogFiles: true,
                rootLogPath: `./temp/logs/run_{RUN_ID}`
            }
        };
        const result = Object.assign({}, defaultInitOptions, userInitOptions);

        if (!isOverrideLogger(result.loggerConfiguration) && result.loggerConfiguration.rootLogPath !== undefined) {
            result.loggerConfiguration.rootLogPath = result.loggerConfiguration.rootLogPath.replace(/{RUN_ID}/g, cliRunFullID);
        }

        return result;
    }

    /**
     * Initialize logger engine (if needed)
     */
    private initLogger() {
        if (isOverrideLogger(this.cliInitOptions.loggerConfiguration)) {
            this.cliLogger = this.cliInitOptions.loggerConfiguration.overrideLogger;
        } else {
            this.cliLogger = new CLILogger(this.cliInitOptions.loggerConfiguration);
        }
    }

    /**
     * Creates a completion promise to be used by the CLI commands <br/>
     * This is needed since yargs doesn't fully support async parsing (See [issue 1420](https://github.com/yargs/yargs/issues/1420) for details)
     * @returns The completion promise
     */
    private getPendingPromise(): IPendingPromise {
        let finishedOK!: (res?: any) => void;
        let finishedError!: (e: Error) => void;

        const resultPromise = new Promise((resolve, reject) => [finishedOK, finishedError] = [resolve, reject]);

        return {finishedError, finishedOK, resultPromise};
    }

}

export {CLI, IBaseCLIArgs, IPendingPromise, ICLIInitOptions};


