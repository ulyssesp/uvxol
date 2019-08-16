import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ActionEvent, EventId, Action, ActionId } from "./types";
import { isContext } from "vm";

const dbConfig = {
    server: "uvxol-db.database.windows.net",
    database: "uvxol-db",
    user:"ulyssesp",
    password: "3wqENGZ7qYQi",
    port: 1433,
    parseJSON: true,
    options: {
        encrypt: true
    }
}
const sql = require('mssql')
const pool = new sql.ConnectionPool(dbConfig)

const connect = async function () {
    return pool.connected ? Promise.resolve(true) : pool.connect();
}

export const getEvents: () => Promise<any> = async function() {
    return connect().then(() => 
        pool.query`select 
            EventId, Name, Delay, Duration, (
                select Actions.ActionId, Location, FilePath, Type, Name 
                from Actions join EventActions 
                on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) 
                for json auto
            ) as Actions
            from Events as E
            for json auto`
    );
}

export const getEventsForTrigger: (triggerId: number) => Promise<any> = async function(triggerId) {
    return connect().then(() =>
        pool.request()
            .input('triggerId', sql.Int, triggerId)
            .query`select 
            EventId, Name, Delay, Duration, (
                select Actions.ActionId, Location, FilePath, Type, Name 
                from Actions join EventActions 
                on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) 
                for json auto
            ) as Actions
            from Events as E
            join EventTriggers as T on (T.TriggerId = @triggerId and T.EventId = E.EventId)
            for json auto`
    )
}

export const getAction: (id: number) => Promise<any> = async function(id) {
    return connect().then(() => pool.request().input('id', sql.Int, id).query`select * from Actions where ActionId = @id for json auto`);
}

export const getActions: () => Promise<any> = async function() {
    return connect().then(() => pool.query`select * from Actions for json auto`);
}

export const insertEvent = async function(
    triggers: EventId[], 
    duration: number, 
    name: string,
    actions: ActionId[],
    delay?: number) {
    return connect()
        .then(() => pool.request()
            .input('duration', sql.Int, duration)
            .input('delay', sql.Int, delay)
            .input('name', sql.Text, name)
            .query`insert into Events (Duration, Delay, Name) output Inserted.EventId values (@duration, @delay, @name)`)
        .then(eventResult => {
            const eventId = eventResult.recordset[0].EventId

            const eventTriggers = new sql.Table("EventTriggers")
            eventTriggers.columns.add('EventId', sql.Int);
            eventTriggers.columns.add('TriggerId', sql.Int);
            triggers.forEach(trigger => {
                eventTriggers.rows.add(eventId, trigger)
            });

            const eventActions = new sql.Table("EventActions");
            eventActions.columns.add('EventId', sql.Int);
            eventActions.columns.add('ActionId', sql.Int);
            actions.forEach(action => {
                eventActions.rows.add(eventId, action)
            });

            return Promise.all([
                triggers.length > 0 ? pool.request().bulk(eventTriggers) : Promise.resolve({}), 
                actions.length > 0 ? pool.request().bulk(eventActions) : Promise.resolve({}), 
            ]);
        })
}

export const insertAction = async function(
    location: string, 
    type: number,
    name: string,
    filePath?: string) {
    return connect()
        .then(() => pool.request()
            .input('location', sql.NVarChar, location)
            .input('type', sql.Int, type)
            .input('name', sql.Text, name)
            .input('filePath', sql.Text, filePath)
            .query`insert into Actions (Location, Type, Name, FilePath) output Inserted.ActionId values (@location, @type, @name, @filePath)`)
}

export const deleteEvent = async (id:number) => 
    id === null || id <= 0 ? 
        { err: "invalid id" } :
        connect()
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from EventActions where EventId = @id`)
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from EventTriggers where (EventId = @id or TriggerId = @id)`)
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from Events where EventId = @id`)

export const deleteAction = async (id:number) => 
    id === null || id <= 0 ? 
        { err: "invalid id" } :
        connect()
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from EventActions where ActionId = @id`)
            .then(() =>
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from Actions where ActionId = @id`)