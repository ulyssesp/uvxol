import { ActionEvent, EventId } from '@/types';
import { array } from 'fp-ts';
import { mapAction } from './Actions';
import { mapVoteOption } from './VoteOptions';
import rp from 'request-promise-native';

export const eventsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/events';

export const getEvents: () => Promise<ActionEvent[]> = () =>
  rp.get({url: eventsuri, json: true })
    .then((as: ActionEvent[][]) => as[0] || [])
    .then(array.map(mapEvent));

export const getEventsForTrigger: (triggerId: EventId) => Promise<ActionEvent[]> = (triggerId) =>
  rp.get({url: eventsuri, qs: { triggerId }, json: true,  })
    .then((as: ActionEvent[][]) => as[0] || [])
    .then(array.map(mapEvent));

export const getStartEvents = () =>
  rp.get({url: eventsuri, qs: { triggerId: -1 }, json: true,  })
    .then((as: ActionEvent[][]) => as[0])
    .then(array.map(mapEvent));

export const mapEvent: (e: any) => ActionEvent = (e: any) => Object.assign(e, {
  actions: array.map(mapAction)(e.actions || []),
  triggers: array.map((t: any) => t.id)(e.triggers || []),
  dependencies: array.map(mapVoteOption)(e.dependencies || []),
  preventions: array.map(mapVoteOption)(e.preventions || []),
});


export const postEvent: (name: string, triggers: number[],
                         duration: number, delay: number,
                         actions: number[], dependencies: number[], preventions: number[]) =>
    Promise<ActionEvent> =
    (name, triggers, duration, delay, actions, dependencies, preventions) =>
        rp.post({url: eventsuri, json: true, body: {name, triggers, duration, delay, actions, dependencies, preventions}}).promise();

export const deleteEvent: (id: number) => Promise<any> =
    (id) => rp({url: eventsuri, qs: { id }, json: true, resolveWithFullResponse: true, method: 'DELETE'}).promise();
