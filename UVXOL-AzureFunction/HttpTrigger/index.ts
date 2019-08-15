import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getEvents } from "../Shared/db"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(await getEvents())
    };
};

export default httpTrigger;
