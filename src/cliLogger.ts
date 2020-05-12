import {Configuration, Logger, configure, getLogger, Appender, shutdown} from "log4js";
/** @ignore */
const path = require('path');

import {cliRunFullID, isExternal} from "./cliRunID";

/**
 * Logger initialization options
 */
interface ICLILoggerOptions {
    /**
     * In case we create log files, where to create them
     * @default `./temp/logs/run_${cliRunFullID}`
     */
    rootLogPath: string,
    /**
     * Create log files or only use console out
     * @default true
     */
    createLogFiles: boolean,
    /**
     * Should the log include a callstack location
     * @default true
     */
    enableCallStack: boolean,
    /**
     * A complete log4s override configuration
     * @default undefined
     */
    log4sOverrideConfiguration?: Configuration
}

/**
 * Facade for any logger to be used by the CLI infrastructure
 */
interface ICLILogger {
    log: (message: string) => void,
    info: (message: string) => void,
    warn: (message: string) => void,
    error: (message: string) => void,
    debug: (message: string) => void,
    trace: (message: string) => void
}

/** @ignore */
let loggerInstance: CLILogger | undefined;

/** @ignore */
const isOverrideLogger = (loggerConfigObject: {overrideLogger: ICLILogger} | Partial<ICLILoggerOptions>): loggerConfigObject is {overrideLogger: ICLILogger} => {
    return ((loggerConfigObject as {overrideLogger: ICLILogger}).overrideLogger !== undefined);
};


/**
 * Import this to log to the unified CLI logs <br/>
 * An unchanging logger facade supporting pre and post logger init reporting
 */
const cliLogger: ICLILogger = {
  info: (message: string) => (loggerInstance ?? console).log(message),
  log: (message: string) => (loggerInstance ?? console).log(message),
  warn: (message: string) => (loggerInstance ?? console).warn(message),
  debug: (message: string) => (loggerInstance ?? console).debug(message),
  trace: (message: string) => (loggerInstance ?? console).trace(message),
  error: (message: string) => (loggerInstance ?? console).error(message)
};

/**
 * Manages logging services for the CLI through log4js
 */
class CLILogger implements ICLILogger {
    /**
     * The log4js logging engine
     */
    private readonly engine!: Logger;
    /**
     * Logger initialization options
     */
    private readonly options!: ICLILoggerOptions;

    /**
     * Closes the active logger instance (if applicable)
     */
    public static async closeLogger(): Promise<void> {
        if (loggerInstance) {
            await new Promise((resolve, reject) => shutdown(err => (err) ? reject(err) : resolve()));
            loggerInstance = undefined;
        }
    }

    public log(message: string) {
        this.engine.info(message);
    }

    public info(message: string) {
        this.engine.info(message);
    }

    public error(message: string) {
        this.engine.error(message);
    }

    public warn(message: string) {
        this.engine.warn(message);
    }

    public debug(message: string) {
        this.engine.debug(message);
    }

    public trace(message: string) {
        this.engine.trace(message);
    }

    /**
     * @param initOptions The user's partial init options
     */
    constructor(initOptions: Partial<ICLILoggerOptions> = {}) {
        if (loggerInstance !== undefined) {
            loggerInstance.debug('cliLogger already initialized. Import cliLogger instead of creating a new instance');
            return loggerInstance;
        }

        this.options = this.getLoggerOptions(initOptions);
        this.configureLogger();

        this.engine = getLogger('cli');

        this.engine.info(`Initialized logged with ID = ${cliRunFullID}${(isExternal) ? ' (external)' : ''}.`);
        if (this.options.createLogFiles) this.engine.info(` Logs saved to ${this.options.rootLogPath}`);

        loggerInstance = this;
    }

    /**
     * Configures the logger log4js engine
     */
    private configureLogger() {

        const defaultLoggerConfiguration: Configuration = {
            appenders: {
                console: {type: 'console'}
            }, categories: {
                cli: {
                    appenders: (this.options.createLogFiles) ? ['console', 'cli_errors', 'cli_all'] : ['console'],
                    level: 'trace',
                    enableCallStack: this.options.enableCallStack
                },
                default: {appenders: ['console'], level: 'trace'}
            }
        };

        const fileAppenders: {[name: string]: Appender} = {
            cli_errors_file: {type: "file", filename: path.resolve(this.options.rootLogPath, 'error.log')},
            cli_all_file: {type: "file", filename: path.resolve(this.options.rootLogPath, 'debug.log')},
            cli_errors: { type: 'logLevelFilter', appender: 'cli_errors_file', level: 'error' },
            cli_all: { type: 'logLevelFilter', appender: 'cli_all_file', level: 'trace' }
        };

        if (this.options.createLogFiles) Object.assign(defaultLoggerConfiguration.appenders, fileAppenders);

        const loggerConfiguration: Configuration = this.options.log4sOverrideConfiguration ?? defaultLoggerConfiguration;

        configure(loggerConfiguration);
    }

    /**
     * Builds the full logger init options from the user's partial options and the default options
     * @param initOptions The user's init options
     * @returns The full logger options
     */
    private getLoggerOptions(initOptions: Partial<ICLILoggerOptions>): ICLILoggerOptions {
        const defaultOptions: ICLILoggerOptions = {
            rootLogPath: `./temp/logs`,
            createLogFiles: true,
            enableCallStack: true
        };

        return Object.assign({}, defaultOptions, initOptions) as ICLILoggerOptions;
    }
}

export {CLILogger, cliLogger, ICLILogger, ICLILoggerOptions, isOverrideLogger};
