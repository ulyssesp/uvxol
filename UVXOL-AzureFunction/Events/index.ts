import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as db from "../Shared/db"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Events request');

    const id = context.bindingData.id;
    const triggerId = parseInt(req.query.triggerId)

    let body = {}

    if (req.method === "GET") {
        if (triggerId != null) {
            body = 
                await db.getEventsForTrigger(triggerId)
                    .then(res => res.recordset)
                    .catch(err => { context.log(err); return { err }});
        } else {
            body = await db.getEvents().then(res => res.recordset)
                .catch(err => { context.log(err); return { err }});
        }
    } else if (req.method === "POST") {
        body = await db.insertEvent(
            req.body.triggers, 
            req.body.duration, 
            req.body.name,
            req.body.action, 
            req.body.delay, 
        ).then(() => ({message: "success"}))
        .catch(err => { context.log(err); return { err }});
    } else if (req.method === "DELETE") {
        body = await db.deleteEvent(id)
            .then(() => ({ message: "success" }))
            .catch(err => ({err}))
    }

    context.res = {
        body: JSON.stringify(body),
        headers: {
            'Content-Type': "application/json"
        }
    };
};

export default httpTrigger;
