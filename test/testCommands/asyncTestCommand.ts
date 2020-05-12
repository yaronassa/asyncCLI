import {AbstractCLICommand, Argv} from "../../src/abstractCLICommand";
import {IBaseCLIArgs} from "../../src/cli";
import {TestInfra} from "../testInfra/testInfra";

interface ITestCommandArgs extends IBaseCLIArgs {
    sharedStorageName: string
}

class AsyncTestCommand extends AbstractCLICommand {
    aliases: string | string[] = [];
    command: string = 'AsyncTest';
    describe: string | false | undefined;

    protected buildCommandArgs(args: Argv<{}>): Argv<{}> {
        return args
            .option('sharedStorageName', {
                type: 'string'
            });
    }

    protected async handleCommand(args: ITestCommandArgs): Promise<boolean> {
        TestInfra.sharedStorage[args.sharedStorageName] = {ran: true, args};
        await new Promise(resolve => setTimeout(() => resolve(), 200));

        this.cliLogger.log('Async Test command executed');

        return true;
    }

}

export default AsyncTestCommand;
export {AsyncTestCommand};
