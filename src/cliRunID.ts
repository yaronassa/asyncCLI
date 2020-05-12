/**
 * Provides process run-id shared by all modules
 * To determine the run-id externally, set the CLI_RUN_ID environment variable for the process
 */

/** @ignore */
const moment = require('moment');
/** @ignore */
const timestamp = moment().format('YYYY-MM-DD-HHmm');

const [
    /** @ignore */
    cliRunID,
    /** @ignore */
    cliRunChild = ''
] = (process.env.CLI_RUN_ID ?? timestamp).split('_');
/** @ignore */
const cliRunFullID = (cliRunChild === '') ? cliRunID : cliRunID + '_' + cliRunChild;
/** @ignore */
const isExternal = (process.env.CLI_RUN_ID !== undefined);

export {
    /**
     * A consistent GUID identifying this CLI run
     */
    cliRunID,
    /**
     * If this is a child run (spawned by a master run), the child's id
     */
    cliRunChild,
    /**
     * The full cli run id tree (master and child, if applicable)
     */
    cliRunFullID,
    /**
     * Was this run id set externally
     */
    isExternal
};
