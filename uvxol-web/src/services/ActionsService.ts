import * as request from 'request-promise-native';
import { Action } from '@/types';
import { array } from 'fp-ts';


export const actionsuri = 'http://localhost:7071/api/actions';

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
        });

export const postAction: (name: string, filePath: string, type: number, location: string) => Promise<any> =
    (name, filePath, type, location) =>
        request.post({url: actionsuri, json: true, body: {name, filePath, type, location}}).promise();

export const deleteAction: (id: number) => Promise<any> =
    (id) =>
        request.delete({url: actionsuri, qs: { id }}).promise();

