import {CLI, IBaseCLIArgs} from "async-cli/lib/cli";
import {cliLogger} from "async-cli/lib/cliLogger";
import {Argv} from "async-cli/lib/abstractCLICommand";

// Usually you'll have some base scheme for shared command options
interface IBaseExampleCLIArgs extends IBaseCLIArgs {
    verboseLogging: boolean
}

class ExampleCLI extends CLI {
    protected addSharedOptions(args: Argv): Argv {
        return args
            .option('verboseLogging', {
               type: "boolean",
               describe: 'Should we log every little thing',
               default: false,
               hidden: true
            })
            // Any yargs parser chaining can be done
            .parserConfiguration({"camel-case-expansion": true, "dot-notation": true, "strip-dashed": true});
    }
}

export {ExampleCLI, IBaseExampleCLIArgs};

if (require.main === module) {
    // This file was executed directly. Invoke the CLI.
    const cli = new ExampleCLI({
        commandsDir: './src/exampleCommands',
        loggerConfiguration: {rootLogPath: './temp/examples/{RUN_ID}'}
    });
    cli.runFromArgs()
        .catch(e => {
            cliLogger.error(`Error running process: ${e.stack}`);
            process.exit(1);
        });
}
