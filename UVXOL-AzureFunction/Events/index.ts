import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as db from "../Shared/db"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Events request');

    const id = req.query.id ? parseInt(req.query.id) : null;
    const triggerId = req.query.triggerId ? parseInt(req.query.triggerId) : null;

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
            req.body.triggers || [], 
            req.body.duration, 
            req.body.name,
            req.body.actions || [], 
            req.body.dependencies || [],
            req.body.preventions || [],
            req.body.delay
        ).then(() => ({message: "success"}))
        .catch(err => { context.log(err); return { err }});
    } else if (req.method === "DELETE") {
        body = await db.deleteEvent(id)
            .then(() => ({ message: "success" }))
            .catch(err => ({err}))
    }

    context.res = {
        body: JSON.stringify(body),
        status: body["err"] ? 400 : 200,
        headers: {
            'Content-Type': "application/json",
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Headers': "content-type",
            'Access-Control-Allow-Methods': "GET,POST,DELETE",
        }
    };
};

export default httpTrigger;
