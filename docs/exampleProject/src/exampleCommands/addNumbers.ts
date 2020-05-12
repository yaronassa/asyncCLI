import {AbstractExampleCLICommand} from "./abstractExampleCLICommand";
import {Argv} from "yargs-async-cli/lib/abstractCLICommand";
import {IBaseExampleCLIArgs} from "../exampleCLI";

// Each command will have a different set of arguments and options
interface IAddNumbersCLIArgs extends IBaseExampleCLIArgs {
    x: number,
    y: number
}

// Amazing, I know
class AddNumbers extends AbstractExampleCLICommand {
    protected command = 'addNumbers';
    protected aliases = ['add'];
    protected describe = 'Add two numbers and reports the result. SCIENCE!';

    protected buildCommandArgs(args: Argv): Argv {
        return args
            .option('x', {
                describe: 'The first number to add',
                demandOption: true,
                type: "number"
            })
            .option('y', {
                describe: 'The second number to add',
                demandOption: true,
                type: "number"
            });
    }

    protected async handleCommand(args: IAddNumbersCLIArgs): Promise<number> {
        if (args.verboseLogging) this.cliLogger.debug(`About to add ${args.x} to ${args.y}`);

        if (isNaN(args.x) || isNaN(args.y)) throw new Error(`Bad x, y arguments`);

        let reportHook = - 1;

        if (args.verboseLogging) {
            // @ts-ignore
            reportHook = setInterval(() => {
                this.cliLogger.debug(`Calculating...`);
            }, 1000);
        }

        const result = await new Promise<number>(resolve => {
            setTimeout(() => resolve(args.x + args.y), 3000);
        });

        clearInterval(reportHook);

        this.cliLogger.debug(`${args.x} + ${args.y} = ${result}`);

        return result;
    }

}

// Note - all command must be accessible via the default export
export default AddNumbers;
