import {IResourceAllocation, ResourceHelper} from "../helpers/resourceHelper";
import {AbstractCLICommand} from "async-cli/lib/abstractCLICommand";


 // Might be useful to create your own base command to allow for shared services and resources
abstract class AbstractExampleCLICommand extends AbstractCLICommand {

    protected resourceHelper = new ResourceHelper();
    protected myImportantResource: IResourceAllocation | undefined;

    // Here we use the pre and post overridable methods to manage all commands resources

    protected async preCommand() {
        this.myImportantResource = await this.resourceHelper.getResource();
    }

    protected async postCommand() {
        if (this.myImportantResource === undefined) return;

        await this.resourceHelper.closeResource(this.myImportantResource.id);
    }

}

export {AbstractExampleCLICommand};
