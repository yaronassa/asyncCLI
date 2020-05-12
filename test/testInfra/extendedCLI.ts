import {CLI, ICLIInitOptions} from "../../src/cli";
import {Argv} from "../../src/abstractCLICommand";

interface ITestingInitOptions extends ICLIInitOptions {
    addSharedOption: boolean
}

class ExtendedCLI extends CLI {
    protected readonly cliInitOptions!: ITestingInitOptions;

    constructor(initOptions: Partial<ITestingInitOptions>) {
        super(initOptions);
    }

    protected addSharedOptions(args: Argv): Argv {
        if (this.cliInitOptions.addSharedOption) {
            return args
                .option('hasDefault', {
                    default: 'isDefaultValue'
                });
        } else {
            return super.addSharedOptions(args);
        }
    }

}

export {ExtendedCLI, ITestingInitOptions};
