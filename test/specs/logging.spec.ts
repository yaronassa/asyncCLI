import {describe, it} from 'mocha';
import {expect} from 'chai';
import {TestInfra} from "../testInfra/testInfra";
import {CLI} from "../../src/cli";

const fsExtra = require('fs-extra');
const fs = require('fs');
const path = require('path');

describe('CLI Logging', () => {
    it('Creates log files by default', async () => {
        const logPath = `./temp/logs/test/${Date.now()}`;
        fsExtra.ensureDirSync(logPath);
        const cli = new CLI({commandsDir: './test/testCommands', loggerConfiguration: {rootLogPath: logPath}});
        await cli.runFromArgs(TestInfra.buildRunArgs('Test', ['--sharedStorageName=createLogsTest']));
        expect(fsExtra.existsSync(path.resolve(logPath, 'debug.log'))).to.equal(true);
        expect(fsExtra.existsSync(path.resolve(logPath, 'error.log'))).to.equal(true);


        fsExtra.removeSync(logPath);
    });

    it('Outputs command parameters', async () => {
        const logPath = `./temp/logs/test/${Date.now()}`;
        fsExtra.ensureDirSync(logPath);
        const cli = new CLI({commandsDir: './test/testCommands', loggerConfiguration: {rootLogPath: logPath}});
        await cli.runFromArgs(TestInfra.buildRunArgs('Test', ['--sharedStorageName=logsCommandParameters']));

        const logContent = fs.readFileSync(path.resolve(logPath, 'debug.log')).toString();

        expect(logContent).to.contain(`Command arguments: {"sharedStorageName":"logsCommandParameters"`);

        fsExtra.removeSync(logPath);
    });

    it('Logs errors', async () => {
        const logPath = `./temp/logs/test/${Date.now()}`;
        fsExtra.ensureDirSync(logPath);
        const cli = new CLI({commandsDir: './test/testCommands', loggerConfiguration: {rootLogPath: logPath}});
        try {
            await cli.runFromArgs(TestInfra.buildRunArgs('FailedTest', ['--sharedStorageName=logsErrors']));
        } catch (e) {}

        const logContent = fs.readFileSync(path.resolve(logPath, 'error.log')).toString();

        expect(logContent).to.contain(`[ERROR] cli - As expected`);

        fsExtra.removeSync(logPath);
    });
});
