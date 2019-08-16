import { ActionEvent } from '@/types';
import { array } from 'fp-ts';
import { mapAction } from './ActionsService';
import { mapVoteOption } from './VoteOptionsService';

const rp = require("request-promise-native");


export const eventsuri = 'http://localhost:7071/api/events';

export const getEvents: () => Promise<ActionEvent[]> = () =>
    rp.get({url: eventsuri, json: true })
        .then((as: ActionEvent[][]) => as[0])
        .then(array.map((e: any) => ({
            id: e.EventId,
            name: e.Name,
            duration: e.Duration,
            delay: e.Delay,
            actions: array.map(mapAction)(e.Actions || []),
            triggers: e.Triggers,
            dependencies: array.map(mapVoteOption)(e.Dependencies || []),
            preventions: array.map(mapVoteOption)(e.Preventions || []),
        })));

export const postEvent: (name: string, triggers: number[], duration: number, delay: number, actions: number[]) => 
    Promise<any> =
    (name, triggers, duration, delay, actions) =>
        rp.post({url: eventsuri, json: true, body: {name, triggers, duration, delay, actions}}).promise();

export const deleteEvent: (id: number) => Promise<any> =
    (id) => rp({url: eventsuri, qs: { id }, json: true, resolveWithFullResponse: true, method: 'DELETE'}).promise();
