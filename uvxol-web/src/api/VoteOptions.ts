import { VoteOption } from '../types';
import { array } from 'fp-ts';


export const voteOptionsUri = 'https://uvxol-httptrigger.azurewebsites.net/api/voteoptions';

export const getVoteOptions: () => Promise<VoteOption[]> = () =>
    fetch(voteOptionsUri)
        .then(res => res.json())
        .then((as: VoteOption[][]) => as[0])
        .then(array.map(mapVoteOption));

export const getEventVoteOptions: () => Promise<VoteOption[]> = () =>
    fetch(voteOptionsUri)
        .then(res => res.json())
        .then((as: VoteOption[][]) => as[0])
        .then(array.map(mapVoteOption));

export const mapVoteOption: (a: any) => VoteOption =
    (a: any) => Object.assign(a, {
        dependencies: array.map((d: any) => d.id)(a.dependencies || []),
        preventions: array.map((d: any) => d.id)(a.preventions || []),
    });

export const postVoteOption: (name: string, text: string, dependencies: number[], preventions: number[])
    => Promise<any> = (name, text, dependencies, preventions) =>
        fetch(voteOptionsUri, { method: 'POST', body: JSON.stringify({ name, text, dependencies, preventions }) });

export const deleteVoteOption: (id: number) => Promise<any> =
    (id) => {
        const params = new URLSearchParams();
        params.set("id", id.toString());
        return fetch(voteOptionsUri + "?" + params.toString(), { method: 'DELETE' });
    }

