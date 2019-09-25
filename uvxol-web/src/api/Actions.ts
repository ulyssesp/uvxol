import * as request from 'request-promise-native';
import { Action, VoteOptionId } from '@/types';
import { array } from 'fp-ts';
import { mapVoteOption } from './VoteOptions';


export const actionsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/actions';

export const getActions: () => Promise<Action[]> = () =>
    request.get({url: actionsuri, json: true })
        .then((as: Action[][]) => as[0])
        .then(array.map(mapAction));

export const mapAction = (a: any) => ({
            id: a.ActionId,
            type: a.Type,
            file: a.FilePath,
            name: a.Name,
            location: a.Location,
            voteOptions: array.map(mapVoteOption)(a.VoteOptions || []),
        });

export const postAction:
    (name: string, filePath: string, type: number, location: string, voteOptions: VoteOptionId[], text: string)
        => Promise<any> = (name, filePath, type, location, voteOptions, text) =>
            request.post({url: actionsuri, json: true, body: {
                name, filePath, type, location, voteOptions, text,
            }}).promise();

export const deleteAction: (id: number) => Promise<any> =
    (id) =>
        request.delete({url: actionsuri, qs: { id }}).promise();

