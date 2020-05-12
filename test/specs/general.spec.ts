import {describe, it} from 'mocha';
import {expect} from 'chai';
import {TestInfra} from "../testInfra/testInfra";
import {CLI} from "../../src/cli";
import {ExtendedCLI} from "../testInfra/extendedCLI";

describe('CLI General', () => {
    it('Runs commands', async () => {
        const cli = new CLI({commandsDir: './test/testCommands', loggerConfiguration: {createLogFiles: false}});
        const result = await cli.runFromArgs(TestInfra.buildRunArgs('Test', ['--sharedStorageName=generalTest']));
        expect(result).to.equal(true);
        expect(TestInfra.sharedStorage.generalTest?.ran).to.equal(true);
    });

    it('Runs async commands', async () => {
        const cli = new CLI({commandsDir: './test/testCommands', loggerConfiguration: {createLogFiles: false}});
        const result = await cli.runFromArgs(TestInfra.buildRunArgs('AsyncTest', ['--sharedStorageName=asyncTest']));
        expect(result).to.equal(true);
        expect(TestInfra.sharedStorage.asyncTest?.ran).to.equal(true);
    });

    it('Can fail', async () => {
        const cli = new CLI({commandsDir: './test/testCommands', loggerConfiguration: {createLogFiles: false}});

        try {
            await cli.runFromArgs(TestInfra.buildRunArgs('FailedTest', []));
            expect.fail('Command was expected to throw');
        } catch (e) {
            expect(e.message).to.equal('As expected');
        }
    });
});
