import { EventId, ActionId, VoteOptionId, } from "./types";
import { array } from 'fp-ts';
import { resolve }  from 'mssql/lib/connectionstring';

    // {
    // server: "uvxol-db-us.database.windows.net",
    // database: "uvxol-db",
    // user:"ulyssesp",
    // password: "",
    // port: 1433,
    // parseJSON: true,
    // options: {
    //     encrypt: true
    // }
// }
const sql = require('mssql')
const dbConfig = Object.assign(resolve(process.env['sqldb_connection'], 'tedious'), { parseJSON: true })
const pool = new sql.ConnectionPool(dbConfig)


const connect = new Promise(function(resolve, reject) {
    pool.connect()
        .then(resolve)
        .catch(reject)
});

export const getEvents: () => Promise<any> = async function() {
    return connect.then(() => 
        pool.query`select 
            EventId, Name, Delay, Duration, 
            (select ET.TriggerId from EventTriggers as ET
                where (ET.EventId = E.EventId) for json auto) as Triggers,
            (select Actions.ActionId, Location, FilePath, Type, Name 
                from Actions join EventActions 
                on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) 
                for json auto
            ) as Actions,
            (select VO.VoteOptionId, VO.Name, VO.Text 
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 0)
                for json auto
            ) as Dependencies,
            (select VO.VoteOptionId, VO.Name, VO.Text 
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 1)
                for json auto
            ) as Preventions
            from Events as E
            for json auto`
    );
}

export const getEventsForTrigger: (triggerId: number) => Promise<any> = async function(triggerId) {
    return connect.then(() =>
        pool.request()
            .input('triggerId', sql.Int, triggerId)
            .query`select 
            EventId, Name, Delay, Duration, (
                select Actions.ActionId, Location, FilePath, Type, Name,
                    (select VO.VoteOptionId, VO.Text, VO.Name from VoteOptions as VO 
                        join ActionVoteOptions as AVO on (AVO.ActionId = Actions.ActionId and VO.VoteOptionId = AVO.VoteOptionId) 
                        for json auto) as VoteOptions
                from Actions join EventActions 
                on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) 
                for json auto
            ) as Actions
            (select VO.VoteOptionId, VO.Name, VO.Text 
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 0)
                for json auto
            ) as Dependencies,
            (select VO.VoteOptionId, VO.Name, VO.Text 
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 1)
                for json auto
            ) as Preventions
            from Events as E
            join EventTriggers as T on (T.TriggerId = @triggerId and T.EventId = E.EventId)
            for json auto`
    )
}

export const getAction: (id: number) => Promise<any> = async function(id) {
    return connect.then(() => pool.request().input('id', sql.Int, id).query`select * from Actions where ActionId = @id for json auto`);
}

export const getActions: () => Promise<any> = async function() {
    return connect.then(() => 
        pool.query`select A.ActionId, A.Name, A.Location, A.FilePath, A.Type, 
            (select VO.VoteOptionId, VO.Name from VoteOptions as VO 
                join ActionVoteOptions as AVO
                on (VO.VoteOptionId = AVO.VoteOptionId and AVO.ActionId = A.ActionId)
            for json auto) as VoteOptions 
            from Actions as A
            for json auto`);
}

export const getVoteOptions = () => 
    connect.then(() => pool.query`
        select VO.VoteOptionId, VO.Name, VO.Text,
            (select VOD.DependencyId
                from VoteOptionDependencies as VOD 
                where (VOD.VoteOptionId = VO.VoteOptionId and VOD.Relationship = 0)
            for json auto) as Dependencies,
            (select VOD.DependencyId
                from VoteOptionDependencies as VOD 
                where (VOD.VoteOptionId = VO.VoteOptionId and VOD.Relationship = 1)
            for json auto) as Preventions
        from VoteOptions as VO 
        for json auto`);

// export const getVoteOptionsForAction = (actionId: number) => 
//     connect.then(() => pool.request()
//         .input('actionId', sql.Int, actionId)
//         .query`select VO.VoteOptionId, VO.Text, VO.Name, 
//             (select VOD.VoteOptionId 
//                 from VoteOptions as VO join VoteOptionDependencies as VOD
//                 on (VOD.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 0)
//                 for json auto
//             ) as Dependencies,
//             (select VO.VoteOptionId 
//                 from VoteOptions as VO join EventVoteOptions as EVO
//                 on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 1)
//                 for json auto
//             ) as Preventions,
//             from VoteOptions as VO 
//             join ActionVoteOptions as E 
//             on (E.VoteOptionId = VO.VoteOptionId and E.EventId = @actionId)
//             for json auto`
//     );

export const insertEvent = async function(
    triggers: EventId[], 
    duration: number, 
    name: string,
    actions: ActionId[],
    dependencies: VoteOptionId[],
    preventions: VoteOptionId[],
    delay?: number) {
    return connect
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

            const eventVoteOptions = new sql.Table("EventVoteOptions")
            eventVoteOptions.columns.add('EventId', sql.Int);
            eventVoteOptions.columns.add('VoteOptionId', sql.Int);
            eventVoteOptions.columns.add('Relationship', sql.Int);
            dependencies.forEach(dep => {
                eventVoteOptions.rows.add(eventId, dep, 0)
            });
            preventions.forEach(prev => {
                eventVoteOptions.rows.add(eventId, prev, 0)
            });

            return Promise.all([
                  triggers.length > 0 ? pool.request().bulk(eventTriggers) : Promise.resolve(), 
                  actions.length > 0 ? pool.request().bulk(eventActions) : Promise.resolve() , 
                  dependencies.length + preventions.length > 0 ? pool.request().bulk(eventVoteOptions) : Promise.resolve(), 
              ]).then(() => eventResult);
        })
}

export const insertAction = async function(
    location: string, 
    type: number,
    name: string,
    voteOptions: number[],
    text?: string,
    filePath?: string) {
    return connect
        .then(() => pool.request()
            .input('location', sql.NVarChar, location)
            .input('type', sql.Int, type)
            .input('name', sql.Text, name)
            .input('text', sql.Text, text)
            .input('filePath', sql.Text, filePath)
            .query`insert into Actions (Location, Type, Name, FilePath, Text) 
                output Inserted.ActionId 
                values (@location, @type, @name, @filePath, @text)`)
            .then(actionResult => {
                const actionId = actionResult.recordset[0].ActionId

                const actionVoteOptions = new sql.Table("ActionVoteOptions")
                actionVoteOptions.columns.add('ActionId', sql.Int);
                actionVoteOptions.columns.add('VoteOptionId', sql.Int);
                voteOptions.forEach(vo => {
                    actionVoteOptions.rows.add(actionId, vo)
                });

                const ps = new sql.PreparedStatement(pool)
                ps.input('actionId', sql.Int)
                ps.input('voteOptionId', sql.Int)
                var psinputs = []
                voteOptions.forEach(voteOptionId => {
                    psinputs.push({actionId, voteOptionId})
                });

                return ps.prepare(`insert into ActionVoteOptions 
                    (ActionId, VoteOptionId) values
                    (@actionId, @voteOptionId)`)
                    .then(() => array.reduce(Promise.resolve(), (p, input) => p.then(() => ps.execute(input)))(psinputs))
                    .then(() => ps.unprepare())
                    .catch(() => ps.unprepare())
            })
}

export const insertVoteOption = (name: string, text: string, dependencies: number[], preventions: number[]) =>
    connect.then(() => 
        pool.request()
            .input('text', sql.Text, text)
            .input('name', sql.Text, name)
            .query`insert into VoteOptions (Text, Name) output Inserted.VoteOptionId values (@text, @name)`)
            .then(voteOptionResult => {
                const voteOptionId = voteOptionResult.recordset[0].VoteOptionId

                const ps = new sql.PreparedStatement(pool)
                ps.input('voteOptionId', sql.Int)
                ps.input('dependencyId', sql.Int)
                ps.input('relationship', sql.Int)
                var psinputs = []
                dependencies.forEach(dep => {
                    psinputs.push({voteOptionId, dependencyId: dep, relationship: 0})
                });

                preventions.forEach(prev => {
                    psinputs.push({voteOptionId, dependencyId: prev, relationship: 1})
                });

                return ps.prepare(`insert into VoteOptionDependencies 
                    (VoteOptionId, DependencyId, Relationship) values
                    (@voteOptionId, @dependencyId, @relationship)`)
                    .then(() => array.reduce(Promise.resolve(), (p, input) => p.then(() => ps.execute(input)))(psinputs))
                    .then(() => ps.unprepare())
                    .catch(() => ps.unprepare())
            })

export const deleteEvent = async (id:number) => 
    id === null || id <= 0 ? 
        { err: "invalid id" } :
        connect
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
                    .query`delete from EventVoteOptions where (EventId = @id)`)
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from Events where EventId = @id`)

export const deleteAction = async (id:number) => 
    id === null || id <= 0 ? 
        { err: "invalid id" } :
        connect
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from EventActions where ActionId = @id`)
            .then(() =>
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from Actions where ActionId = @id`)

export const deleteVoteOption = async (id: number) =>
    id === null || id <= 0 ? 
        { err: "invalid id" } :
        connect
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from EventVoteOptions where VoteOptionId = @id`)
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from ActionVoteOptions where VoteOptionId = @id`)
            .then(() => 
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from VoteOptionDependencies where VoteOptionId = @id or DependencyId = @id`)
            .then(() =>
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from VoteOptions where VoteOptionId = @id`)
