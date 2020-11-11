import { Action, ActionEvent, ActionType, TypesActionMap, VoteOption } from "./types";
import * as http from "http"
import fetch from "node-fetch";


export const eventsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/events';
export const actionsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/actions';
export const voteOptionsUri = 'https://uvxol-httptrigger.azurewebsites.net/api/voteoptions';
export const startVoteUri = "https://uvxol-httptrigger.azurewebsites.net/api/twitchVoteOptions";

export const mapEvent: (e: any) => ActionEvent = (e: any) => Object.assign(e, {
  actions: (e.actions || []).map(mapAction),
  triggers: (e.triggers || []).map((t: any) => t.id),
  dependencies: (e.dependencies || []).map(mapVoteOption),
  preventions: (e.preventions || []).map(mapVoteOption),
});

export const mapAction = (a: any) => Object.assign(a, {
  type: TypesActionMap[a.type],
  voteOptions: (a.voteOptions || []).map(mapVoteOption),
});

export const mapVoteOption: (a: any) => VoteOption =
  (a: any) => Object.assign(a, {
    dependencies: (a.dependencies || []).map((d: any) => d.id),
    preventions: (a.preventions || []).map((d: any) => d.id),
  });

export const getEvents: () => Promise<ActionEvent[]> = () =>
  fetch(eventsuri)
    .then((res: any) => res.json())
    .then((as: ActionEvent[][]) => as[0] || [])
    .then((as: ActionEvent[]) => as.map(mapEvent));

export const getActions: () => Promise<Action<ActionType>[]> = () =>
  fetch(actionsuri)
    .then(res => res.json())
    .then((as: any[][]) => as[0])
    .then(as => as.map(mapAction));

export const getVoteOptions: () => Promise<VoteOption[]> = () =>
  fetch(voteOptionsUri)
    .then(res => res.json())
    .then((as: VoteOption[][]) => as[0])
    .then(vos => vos.map(mapVoteOption));

export const startVote = (zone: string, voteOptions: { name: string, voteOptionId: number, actionId: number }[]) =>
  fetch(startVoteUri, {
    method: "post",
    body: JSON.stringify({ zone, voteOptions })
  })