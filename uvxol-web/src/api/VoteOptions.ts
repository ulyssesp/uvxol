import * as request from 'request-promise-native';
import { VoteOption } from '../types';
import { array } from 'fp-ts';


export const voteOptionsUri = 'https://uvxol-httptrigger.azurewebsites.net/api/voteoptions';

export const getVoteOptions: () => Promise<VoteOption[]> = () =>
    request.get({url: voteOptionsUri, json: true })
        .then((as: VoteOption[][]) => as[0])
        .then(array.map(mapVoteOption));

export const getEventVoteOptions: () => Promise<VoteOption[]> = () =>
    request.get({url: voteOptionsUri, json: true })
        .then((as: VoteOption[][]) => as[0])
        .then(array.map(mapVoteOption));

export const mapVoteOption: (a: any) => VoteOption =
  (a: any) => Object.assign(a, {
            dependencies: array.map((d: any) => d.DependencyId)(a.dependencies || []),
            preventions: array.map((d: any) => d.DependencyId)(a.preventions || []),
        });

export const postVoteOption: (name: string, text: string, dependencies: number[], preventions: number[])
    => Promise<any> = (name, text, dependencies, preventions) =>
        request.post({url: voteOptionsUri, json: true, body: { name, text, dependencies, preventions }}).promise();

export const deleteVoteOption: (id: number) => Promise<any> =
    (id) =>
        request.delete({url: voteOptionsUri, qs: { id }}).promise();

