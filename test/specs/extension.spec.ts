import {describe, it} from 'mocha';
import {expect} from 'chai';
import {TestInfra} from "../testInfra/testInfra";
import {ExtendedCLI} from "../testInfra/extendedCLI";

describe('Inheritance and extension', () => {

    it('Can extend the CLI', async () => {
        const cli = new ExtendedCLI({commandsDir: './test/testCommands', loggerConfiguration: {createLogFiles: false}});
        await cli.runFromArgs(TestInfra.buildRunArgs('Test', ['--sharedStorageName=extensionTest']));
        expect(TestInfra.sharedStorage.extensionTest?.ran).to.equal(true);
    });

    it('Can extend the CLI with shared options', async () => {
        const cli = new ExtendedCLI({commandsDir: './test/testCommands', loggerConfiguration: {createLogFiles: false}, addSharedOption: true});
        await cli.runFromArgs(TestInfra.buildRunArgs('Test', ['--sharedStorageName=extensionSharedOptionsTest']));
        expect(TestInfra.sharedStorage.extensionSharedOptionsTest?.args.hasDefault).to.equal('isDefaultValue');
    });
});
