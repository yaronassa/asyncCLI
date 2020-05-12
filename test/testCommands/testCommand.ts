import {AbstractCLICommand, Argv} from "../../src/abstractCLICommand";
import {IBaseCLIArgs} from "../../src/cli";
import {TestInfra} from "../testInfra/testInfra";

interface ITestCommandArgs extends IBaseCLIArgs {
    sharedStorageName: string
}

class TestCommand extends AbstractCLICommand {
    aliases: string | string[] = [];
    command: string = 'Test';
    describe: string | false | undefined;

    protected buildCommandArgs(args: Argv<{}>): Argv<{}> {
        return args
            .option('sharedStorageName', {
                type: 'string'
            });
    }

    protected async handleCommand(args: ITestCommandArgs): Promise<boolean> {
        TestInfra.sharedStorage[args.sharedStorageName] = {ran: true, args};
        this.cliLogger.log('Test command executed');

        return true;
    }

}

export default TestCommand;
export {TestCommand};
