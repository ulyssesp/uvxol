import { ActionEvent, EventId } from '@/types';
import { array } from 'fp-ts';
import { mapAction } from './Actions';
import { mapVoteOption } from './VoteOptions';

export const eventsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/events';

export const getEvents: () => Promise<ActionEvent[]> = () =>
  fetch(eventsuri)
    .then(res => res.json())
    .then((as: ActionEvent[][]) => as[0] || [])
    .then(array.map(mapEvent));

export const getEvent: (id: number) => Promise<ActionEvent> = id => {
  const params = new URLSearchParams();
  params.append("id", id.toString());

  return fetch(eventsuri + "?" + params.toString(), { method: "GET" })
    .then(res => res.json())
    .then(e => e[0])
    .then(mapEvent);
}

export const getEventsForTrigger: (triggerId: EventId) => Promise<ActionEvent[]> = (triggerId) => {

  const params = new URLSearchParams();
  params.append("triggerId", triggerId.toString());

  return fetch(eventsuri + "?" + params.toString(), { method: 'GET' })
    .then(res => res.json())
    .then((as: ActionEvent[][]) => as[0] || [])
    .then(array.map(mapEvent));
}

export const getStartEvents = () => {
  const params = new URLSearchParams();
  params.append("triggerId", "-1");

  return fetch(eventsuri + "?" + params.toString(), { method: 'GET' })
    .then(res => res.json())
    .then((as: ActionEvent[][]) => as[0] || [])
    .then(array.map(mapEvent));
}

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
    fetch(eventsuri, { method: 'POST', body: JSON.stringify({ name, triggers, duration, delay, actions, dependencies, preventions }) })
      .then(res => res.json());

export const putEvent: (id: number, name: string, triggers: number[],
  duration: number, delay: number,
  actions: number[], dependencies: number[], preventions: number[]) =>
  Promise<ActionEvent> =
  (id, name, triggers, duration, delay, actions, dependencies, preventions) =>
    fetch(eventsuri, {
      method: 'PUT',
      body: JSON.stringify({ id, name, triggers, duration, delay, actions, dependencies, preventions })
    })
      .then(res => res.json());

export const deleteEvent: (id: number) => Promise<any> =
  (id) => {
    const params = new URLSearchParams();
    params.set("id", id.toString());
    return fetch(eventsuri + "?" + params.toString(), { method: 'DELETE' })
  }
