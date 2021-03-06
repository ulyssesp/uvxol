import { EventId, ActionId, VoteOptionId, } from "./types";
import { array } from 'fp-ts';
import { resolve } from 'mssql/lib/connectionstring';

const sql = require('mssql')
const dbConfig = Object.assign(resolve(process.env['sqldb_connection'], 'tedious'), { parseJSON: true })
const pool = new sql.ConnectionPool(dbConfig)


const connect: Promise<any> = new Promise(function (resolve, reject) {
    pool.connect()
        .then(resolve)
        .catch(reject)
});

const connectRequest = () => connect.then(pool.request());

export const getEvent: (id: EventId) => Promise<any> = async function (id) {
    return connect.then(() =>
        pool.request().input('id', sql.Int, id).query`select 
            EventId as id, Name as name, Delay as delay, Duration as duration, 
            (select ET.TriggerId as id from EventTriggers as ET
                where (ET.EventId = E.EventId) for json auto) as triggers,
            (select Actions.ActionId as id, Zone as zone, Location as location, FilePath as filePath, Type as type, Name as name, FunMeterValue as funMeterValue, BudgetMeterValue as budgetMeterValue,
                    (select VO.VoteOptionId as id, VO.Text as text, VO.Name as name, VO.ShortName as shortname, VO.FunRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement from VoteOptions as VO 
                        join ActionVoteOptions as AVO on (AVO.ActionId = Actions.ActionId and VO.VoteOptionId = AVO.VoteOptionId) 
                        for json auto) as voteOptions
                from Actions join EventActions 
                on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) 
                for json auto
            ) as actions,
            (select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 0)
                for json auto
            ) as dependencies,
            (select VO.VoteOptionId as id, VO.Name as name, VO.Text  as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 1)
                for json auto
            ) as preventions
            from Events as E
            where (E.EventId = @id)
            for json auto`
    );
}

export const getEvents: () => Promise<any> = async function () {
    return connect.then(() =>
        pool.query`select 
            EventId as id, Name as name, Delay as delay, Duration as duration, 
            (select ET.TriggerId as id from EventTriggers as ET
                where (ET.EventId = E.EventId) for json auto) as triggers,
            (select Actions.ActionId as id, Zone as zone, Location as location, FilePath as filePath, Type as type, Name as name, FunMeterValue as funMeterValue, BudgetMeterValue as budgetMeterValue
                from Actions join EventActions 
                on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) 
                for json auto
            ) as actions,
            (select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 0)
                for json auto
            ) as dependencies,
            (select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 1)
                for json auto
            ) as preventions
            from Events as E
            for json auto`
    );
}

export const getEventsForTrigger: (triggerId: number) => Promise<any> = async function (triggerId) {
    return connect.then(() =>
        pool.request()
            .input('triggerId', sql.Int, triggerId)
            .query`select 
            E.EventId as id, Name as name, Delay as delay, Duration as duration, 
            (select ET.TriggerId as id from EventTriggers as ET
                where (ET.EventId = E.EventId) for json auto) as triggers,
            (select Actions.ActionId as id, Zone as zone, Location as location, FilePath as filePath, Type as type, Name as name, FunMeterValue as funMeterValue, BudgetMeterValue as budgetMeterValue,
                    (select VO.VoteOptionId as id, VO.Text as text, VO.Name as name, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement from VoteOptions as VO 
                        join ActionVoteOptions as AVO on (AVO.ActionId = Actions.ActionId and VO.VoteOptionId = AVO.VoteOptionId) 
                        for json auto) as voteOptions
                from Actions join EventActions 
                on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) 
                for json auto
            ) as actions,
            (select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 0)
                for json auto
            ) as dependencies,
            (select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 1)
                for json auto
            ) as preventions
            from Events as E
            join EventTriggers as T on (T.EventId = @triggerId and T.TriggerId = E.EventId)
            for json auto`
    )
}

export const getStartEvents: () => Promise<any> = async function () {
    return connect.then(() =>
        pool.request()
            .query`select 
            EventId as id, Name as name, Delay as delay, Duration as duration, 
            (select ET.TriggerId as id from EventTriggers as ET
                where (ET.EventId = E.EventId) for json auto) as triggers,
            (select Actions.ActionId as id, Zone as zone, Location as location, FilePath as filePath, Type as type, Name as name, FunMeterValue as funMeterValue, BudgetMeterValue as budgetMeterValue,
                    (select VO.VoteOptionId as id, VO.Text as text, VO.Name as name, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement from VoteOptions as VO 
                        join ActionVoteOptions as AVO on (AVO.ActionId = Actions.ActionId and VO.VoteOptionId = AVO.VoteOptionId) 
                        for json auto) as voteOptions
                from Actions join EventActions 
                on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) 
                for json auto
            ) as actions,
            (select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 0)
                for json auto
            ) as dependencies,
            (select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement
                from VoteOptions as VO join EventVoteOptions as EVO
                on (EVO.EventId = E.EventId and VO.VoteOptionId = EVO.VoteOptionId and EVO.Relationship = 1)
                for json auto
            ) as preventions
            from Events as E
            where not exists (select 1 from EventTriggers as T where T.TriggerId = E.EventId)
            for json auto`
    )
}


export const getAction: (id: number) => Promise<any> = async function (id) {
    return connect.then(() => pool.request().input('id', sql.Int, id)
        .query`select A.ActionId as id, A.Name as name, A.Zone as zone, A.Location as location, A.FilePath as filePath, A.Type as type, A.FunMeterValue as funMeterValue, A.BudgetMeterValue as budgetMeterValue,
            (select VO.VoteOptionId as id, VO.Name as name, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement from VoteOptions as VO 
                join ActionVoteOptions as AVO
                on (VO.VoteOptionId = AVO.VoteOptionId and AVO.ActionId = A.ActionId)
            for json auto) as voteOptions 
            from Actions as A
            where A.ActionId = @id
            for json auto`);
}

export const getActions: () => Promise<any> = async function () {
    return connect.then(() =>
        pool.query`select A.ActionId as id, A.Name as name, A.Zone as zone, A.Location as location, A.FilePath as filePath, A.Type as type, A.FunMeterValue as funMeterValue, A.BudgetMeterValue as budgetMeterValue,
            (select VO.VoteOptionId as id, VO.Name as name, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement from VoteOptions as VO 
                join ActionVoteOptions as AVO
                on (VO.VoteOptionId = AVO.VoteOptionId and AVO.ActionId = A.ActionId)
            for json auto) as voteOptions 
            from Actions as A
            for json auto`);
}

export const getVoteOption = (id: number) =>
    connect.then(() => pool.request().input('id', sql.Int, id).query`
        select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement,
            (select VOD.DependencyId as id
                from VoteOptionDependencies as VOD 
                where (VOD.VoteOptionId = VO.VoteOptionId and VOD.Relationship = 0)
            for json auto) as dependencies,
            (select VOD.DependencyId as id
                from VoteOptionDependencies as VOD 
                where (VOD.VoteOptionId = VO.VoteOptionId and VOD.Relationship = 1)
            for json auto) as preventions
        from VoteOptions as VO 
        where VO.VoteOptionId = @id
        for json auto`);

export const getVoteOptions = () =>
    connect.then(() => pool.query`
        select VO.VoteOptionId as id, VO.Name as name, VO.Text as text, VO.ShortName as shortname, VO.funRequirement as funRequirement, VO.BudgetRequirement as budgetRequirement,
            (select VOD.DependencyId as id
                from VoteOptionDependencies as VOD 
                where (VOD.VoteOptionId = VO.VoteOptionId and VOD.Relationship = 0)
            for json auto) as dependencies,
            (select VOD.DependencyId as id
                from VoteOptionDependencies as VOD 
                where (VOD.VoteOptionId = VO.VoteOptionId and VOD.Relationship = 1)
            for json auto) as preventions
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


export const insertEvent = async function (
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
            .query`insert into Events (Duration, Delay, Name) output Inserted.* values (@duration, @delay, @name)`)
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

            const ps = new sql.PreparedStatement(pool)
            ps.input('eventId', sql.Int)
            ps.input('voteOptionId', sql.Int)
            ps.input('relationship', sql.Int)
            var psinputs = []
            dependencies.forEach(dep => {
                psinputs.push({ eventId, voteOptionId: dep, relationship: 0 })
            });

            preventions.forEach(prev => {
                psinputs.push({ eventId, voteOptionId: prev, relationship: 1 })
            });

            return Promise.all([
                triggers.length > 0 ? pool.request().bulk(eventTriggers) : Promise.resolve(),
                actions.length > 0 ? pool.request().bulk(eventActions) : Promise.resolve(),
                ps.prepare(`insert into EventVoteOptions 
                              (EventId, VoteOptionId, Relationship) values
                              (@eventId, @voteOptionId, @relationship)`)
                    .then(() => array.reduce(Promise.resolve(), (p, input) => p.then(() => ps.execute(input)))(psinputs))
                    .then(ps.unprepare())
                    .catch(ps.unprepare())
            ]).then(() => getEvent(eventId));
        })
}

export const insertAction = async function (
    zone: string,
    location: string,
    type: number,
    name: string,
    voteOptions: number[],
    funMeterValue: number,
    budgetMeterValue: number,
    text?: string,
    filePath?: string) {
    return connect
        .then(() => pool.request()
            .input('zone', sql.NVarChar, zone)
            .input('location', sql.NVarChar, location)
            .input('type', sql.Int, type)
            .input('name', sql.Text, name)
            .input('text', sql.Text, text)
            .input('filePath', sql.Text, filePath)
            .input('funMeterValue', sql.Int, funMeterValue)
            .input('budgetMeterValue', sql.Int, budgetMeterValue)
            .query`insert into Actions (Zone, Location, Type, Name, FilePath, Text, FunMeterValue, BudgetMeterValue) 
                output Inserted.ActionId 
                values (@zone, @location, @type, @name, @filePath, @text, @funMetervalue, @budgetMeterValue)`)
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
                psinputs.push({ actionId, voteOptionId })
            });

            return ps.prepare(`insert into ActionVoteOptions 
                    (ActionId, VoteOptionId) values
                    (@actionId, @voteOptionId)`)
                .then(() => array.reduce(Promise.resolve(), (p, input) => p.then(() => ps.execute(input)))(psinputs))
                .then(() => ps.unprepare())
                .catch(() => ps.unprepare())
                .then(() => getAction(actionId));
        })
}

export const insertVoteOption = (name: string, shortname: string, text: string, funRequirement: number | undefined, budgetRequirement: number | undefined, dependencies: number[], preventions: number[]) =>
    connect.then(() =>
        pool.request()
            .input('text', sql.Text, text)
            .input('name', sql.Text, name)
            .input('shortname', sql.Text, shortname)
            .input('funRequirement', sql.Int, funRequirement)
            .input('budgetRequirement', sql.Int, budgetRequirement)
            .query`insert into VoteOptions (Text, Name, ShortName, FunRequirement, BudgetRequirement) output Inserted.VoteOptionId values (@text, @name, @shortname, @funRequirement, @budgetRequirement)`)
        .then(voteOptionResult => {
            const voteOptionId = voteOptionResult.recordset[0].VoteOptionId

            const ps = new sql.PreparedStatement(pool)
            ps.input('voteOptionId', sql.Int)
            ps.input('dependencyId', sql.Int)
            ps.input('relationship', sql.Int)
            var psinputs = []
            dependencies.forEach(dep => {
                psinputs.push({ voteOptionId, dependencyId: dep, relationship: 0 })
            });

            preventions.forEach(prev => {
                psinputs.push({ voteOptionId, dependencyId: prev, relationship: 1 })
            });

            return ps.prepare(`insert into VoteOptionDependencies 
                    (VoteOptionId, DependencyId, Relationship) values
                    (@voteOptionId, @dependencyId, @relationship)`)
                .then(() => array.reduce(Promise.resolve(), (p, input) => p.then(() => ps.execute(input)))(psinputs))
                .then(() => ps.unprepare())
                .catch(() => ps.unprepare())
                .then(() => getVoteOption(voteOptionId))
        });

const deleteEventActionsByEventId = async (id: number) =>
    connectRequest().then(c => c.query`delete from EventActions where EventId = ${id}`);

const deleteEventActionsByActionId = async (id: number) =>
    connectRequest().then(c => c.query`delete from EventActions where ActionId = ${id}`);

const deleteEventTriggersByEventId = async (id: number) =>
    connectRequest().then(c => c.query`delete from EventTriggers where EventId = ${id}`);

const deleteEventTriggersByTriggerId = async (id: number) =>
    connectRequest().then(c => c.query`delete from EventTriggers where TriggerId = ${id}`);

const deleteEventVoteOptionsByEventId = async (id: number) =>
    connectRequest().then(c => c.query`delete from EventVoteOptions where EventId = ${id}`);

const deleteVoteOptionDependenciesByVoteOptionId = async (id: number) =>
    connectRequest().then(c => c.query`delete from VoteOptionDependencies where VoteOptionId=${id}`);

export const deleteEvent = async (id: number) =>
    id === null || id <= 0 ?
        { err: "invalid id" } :
        connect
            .then(() => deleteEventActionsByEventId(id))
            .then(() => deleteEventTriggersByEventId(id))
            .then(() => deleteEventTriggersByTriggerId(id))
            .then(() => deleteEventVoteOptionsByEventId(id))
            .then(() =>
                pool.request()
                    .input('id', sql.Int, id)
                    .query`delete from Events where EventId = @id`)

const deleteActionVoteOptionsByActionId = async (id: number) =>
    connectRequest().then(c => c.query`delete from ActionVoteOptions where ActionId = ${id}`);

export const deleteAction = async (id: number) =>
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
                    .query`delete from ActionVoteOptions where ActionId = @id`)
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



export const updateEvent = async function (
    id: EventId,
    triggers: EventId[],
    duration: number,
    name: string,
    actions: ActionId[],
    dependencies: VoteOptionId[],
    preventions: VoteOptionId[],
    delay?: number) {
    return connect
        .then(() => pool.request()
            .input('id', sql.Int, id)
            .input('duration', sql.Int, duration)
            .input('delay', sql.Int, delay)
            .input('name', sql.Text, name)
            .query`update Events set Duration = @duration, Delay = @delay, Name = @name where EventId = @id`)
        .then(() => deleteEventVoteOptionsByEventId(id))
        .then(() => deleteEventTriggersByEventId(id))
        .then(() => deleteEventActionsByEventId(id))
        .then(() => {
            const eventId = id;

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

            const ps = new sql.PreparedStatement(pool)
            ps.input('eventId', sql.Int)
            ps.input('voteOptionId', sql.Int)
            ps.input('relationship', sql.Int)
            var psinputs = []
            dependencies.forEach(dep => {
                psinputs.push({ eventId, voteOptionId: dep, relationship: 0 })
            });

            preventions.forEach(prev => {
                psinputs.push({ eventId, voteOptionId: prev, relationship: 1 })
            });

            return Promise.all([
                triggers.length > 0 ? pool.request().bulk(eventTriggers) : Promise.resolve(),
                actions.length > 0 ? pool.request().bulk(eventActions) : Promise.resolve(),
                ps.prepare(`insert into EventVoteOptions 
                      (EventId, VoteOptionId, Relationship) values
                      (@eventId, @voteOptionId, @relationship)`)
                    .then(() => array.reduce(Promise.resolve(), (p, input) => p.then(() => ps.execute(input)))(psinputs))
                    .then(ps.unprepare())
                    .catch(ps.unprepare())
            ]).then(() => getEvent(eventId));
        })
}

export const updateAction = async function (
    id: ActionId,
    zone: string,
    location: string,
    type: number,
    name: string,
    voteOptions: VoteOptionId[],
    funMeterValue: number,
    budgetMeterValue: number,
    text: string,
    filePath: string) {
    return connect
        .then(() => pool.request()
            .input('id', sql.Int, id)
            .input('zone', sql.NVarChar, zone)
            .input('location', sql.NVarChar, location)
            .input('type', sql.Int, type)
            .input('name', sql.Text, name)
            .input('text', sql.Text, text)
            .input('filePath', sql.Text, filePath)
            .input('funMeterValue', sql.Int, funMeterValue)
            .input('budgetMeterValue', sql.Int, budgetMeterValue)
            .query`update Actions set 
                Zone=@zone,
                Location=@location,
                Type=@type,
                Name=@name,
                FunMeterValue=@funMeterValue,
                BudgetMeterValue=@budgetMeterValue,
                Text=@text,
                FilePath=@filePath 
                where ActionId = @id`)
        .then(() => deleteActionVoteOptionsByActionId(id))
        .then(actionResult => {
            const actionId = id;

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
                psinputs.push({ actionId, voteOptionId })
            });

            return ps.prepare(`insert into ActionVoteOptions 
                    (ActionId, VoteOptionId) values
                    (@actionId, @voteOptionId)`)
                .then(() => array.reduce(Promise.resolve(), (p, input) => p.then(() => ps.execute(input)))(psinputs))
                .then(() => ps.unprepare())
                .catch(() => ps.unprepare())
                .then(() => getAction(actionId));
        })
}

export const updateVoteOption = async function (
    id: VoteOptionId,
    name: string,
    shortname: string,
    text: string,
    funRequirement: number | undefined,
    budgetRequirement: number | undefined,
    dependencies: number[],
    preventions: number[]
) {
    return connect
        .then(() =>
            pool.request()
                .input('id', sql.Int, id)
                .input('text', sql.Text, text)
                .input('name', sql.Text, name)
                .input('shortname', sql.Text, shortname)
                .input('funRequirement', sql.Int, funRequirement)
                .input('budgetRequirement', sql.Int, budgetRequirement)
                .query`update VoteOptions set Text=@text, Name=@name, ShortName=@shortname, FunRequirement=@funRequirement, BudgetRequirement=@budgetRequirement where VoteOptionId=@id`)
        .then(() => deleteVoteOptionDependenciesByVoteOptionId(id))
        .then(voteOptionsResult => {
            const voteOptionId = id;

            const ps = new sql.PreparedStatement(pool)
            ps.input('voteOptionId', sql.Int)
            ps.input('dependencyId', sql.Int)
            ps.input('relationship', sql.Int)
            var psinputs = []
            dependencies.forEach(dep => {
                psinputs.push({ voteOptionId, dependencyId: dep, relationship: 0 })
            });

            preventions.forEach(prev => {
                psinputs.push({ voteOptionId, dependencyId: prev, relationship: 1 })
            });

            return ps.prepare(`insert into VoteOptionDependencies 
                    (VoteOptionId, DependencyId, Relationship) values
                    (@voteOptionId, @dependencyId, @relationship)`)
                .then(() => array.reduce(Promise.resolve(), (p, input) => p.then(() => ps.execute(input)))(psinputs))
                .then(() => ps.unprepare())
                .catch(() => ps.unprepare())
                .then(() => getVoteOption(voteOptionId))
        })
}