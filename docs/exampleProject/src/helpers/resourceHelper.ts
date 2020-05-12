import {cliLogger} from "yargs-async-cli/lib/cliLogger";

interface IResourceAllocation {
    id: number,
    resource: any
}

/**
 * Represents some resource wrapper you might use
 */
class ResourceHelper {
    private idCounter: number = 0;
    public async getResource(): Promise<IResourceAllocation> {
        const currentID = this.idCounter;
        this.idCounter = this.idCounter + 1;

        cliLogger.log(`Allocated resource ${currentID}`);
        // open some very important resource
        return {resource: 'https://imgflip.com/i/415l76', id: currentID};
    }

    public async closeResource(resourceID: number) {
        // close the resource
        cliLogger.log(`Freed resource ${resourceID}`);
    }
}

export {ResourceHelper, IResourceAllocation};
