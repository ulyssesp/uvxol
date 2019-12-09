import * as request from 'request-promise-native';
import { ActionTypesMap, TypesActionMap } from '@/types';
import { array } from 'fp-ts';
import { mapVoteOption } from './VoteOptions';
export const actionsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/actions';
export const getActions = () => request.get({ url: actionsuri, json: true })
    .then((as) => as[0])
    .then(array.map(mapAction));
export const mapAction = (a) => Object.assign(a, {
    type: TypesActionMap[a.type],
    voteOptions: array.map(mapVoteOption)(a.voteOptions || []),
});
export const postAction = (name, filePath, type, location, voteOptions, text) => request.post({ url: actionsuri, json: true, body: {
        name, filePath, type: ActionTypesMap[type], location, voteOptions, text,
    } }).promise();
export const deleteAction = (id) => request.delete({ url: actionsuri, qs: { id } }).promise();
//# sourceMappingURL=Actions.js.map