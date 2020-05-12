import {AbstractCLICommand, Argv} from "../../src/abstractCLICommand";
import {IBaseCLIArgs} from "../../src/cli";


class AsyncTestCommand extends AbstractCLICommand {
    aliases: string | string[] = [];
    command: string = 'FailedTest';
    describe: string | false | undefined;

    protected buildCommandArgs(args: Argv<{}>): Argv<{}> {
        return args
            .option('sharedStorageName', {
                type: 'string'
            });
    }

    protected async handleCommand(args: IBaseCLIArgs): Promise<any> {
        throw new Error(`As expected`);
    }

}

export default AsyncTestCommand;
export {AsyncTestCommand};
