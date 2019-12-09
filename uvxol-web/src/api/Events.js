import { array } from 'fp-ts';
import { mapAction } from './Actions';
import { mapVoteOption } from './VoteOptions';
import rp from 'request-promise-native';
export const eventsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/events';
export const getEvents = () => rp.get({ url: eventsuri, json: true })
    .then((as) => as[0] || [])
    .then(array.map(mapEvent));
export const getEventsForTrigger = (triggerId) => rp.get({ url: eventsuri, qs: { triggerId }, json: true, })
    .then((as) => as[0] || [])
    .then(array.map(mapEvent));
export const getStartEvents = () => rp.get({ url: eventsuri, qs: { triggerId: -1 }, json: true, })
    .then((as) => as[0])
    .then(array.map(mapEvent));
export const mapEvent = (e) => Object.assign(e, {
    actions: array.map(mapAction)(e.actions || []),
    triggers: array.map((t) => t.id)(e.triggers || []),
    dependencies: array.map(mapVoteOption)(e.dependencies || []),
    preventions: array.map(mapVoteOption)(e.preventions || []),
});
export const postEvent = (name, triggers, duration, delay, actions, dependencies, preventions) => rp.post({ url: eventsuri, json: true, body: { name, triggers, duration, delay, actions, dependencies, preventions } }).promise();
export const deleteEvent = (id) => rp({ url: eventsuri, qs: { id }, json: true, resolveWithFullResponse: true, method: 'DELETE' }).promise();
//# sourceMappingURL=Events.js.map