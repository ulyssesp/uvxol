import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as db from "../Shared/db"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('VoteOptions request');

    const id = req.query.id ? parseInt(req.query.id) : null;
    const eventId = req.query.eventId ? parseInt(req.query.eventId) : null;

    let body = {}

    if (req.method === "GET") {
        if (eventId != null) {
            // body = 
            //     await db.getVoteOptionsForEvent(eventId)
            //         .then(res => res.recordset)
            //         .catch(err => { context.log(err); return { err }});
        } else {
            body = await db.getVoteOptions()
                .then(res => res.recordset)
                .catch(err => { context.log(err); return { err } });
        }
    } else if (req.method === "POST") {
        body = await db.insertVoteOption(
            req.body.name,
            req.body.shortname,
            req.body.text,
            req.body.funRequirement,
            req.body.budgetRequirement,
            req.body.dependencies,
            req.body.preventions,
        )
            .then(res => res.recordset[0][0])
            .catch(err => { context.log(err); return { err } });
    } else if (req.method === "PUT") {
        body = await db.updateVoteOption(
            req.body.id,
            req.body.name,
            req.body.shortname,
            req.body.text,
            req.body.funRequirement,
            req.body.budgetRequirement,
            req.body.dependencies,
            req.body.preventions
        )
            .then(res => res.recordset[0][0])
            .catch(err => { context.log(err); return { err } });
    } else if (req.method === "DELETE") {
        body = await db.deleteVoteOption(id)
            .then(() => ({ message: "success" }))
            .catch(err => ({ err }))
    }

    context.res = {
        body: JSON.stringify(body),
        status: body["err"] ? 400 : 200,
        headers: {
            'Content-Type': "application/json",
            // 'Access-Control-Allow-Origin': "*",
            // 'Access-Control-Allow-Headers': "content-type",
            // 'Access-Control-Allow-Methods': "GET,POST,DELETE",
        }
    };
};

export default httpTrigger;
