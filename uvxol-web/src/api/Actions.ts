import { Action, ActionTypesMap, VoteOptionId, TypesActionMap, EditableAction, ServerType, ActionType } from '@/types';
import { array } from 'fp-ts';
import { mapVoteOption } from './VoteOptions';
import actions from '@/store/modules/actions';


export const actionsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/actions';

export const getActions: () => Promise<Action<ActionType>[]> = () =>
    fetch(actionsuri)
        .then(res => res.json())
        .then((as: any[][]) => as[0])
        .then(array.map(mapAction));

export const mapAction = (a: any) => Object.assign(a, {
    type: TypesActionMap[a.type],
    voteOptions: array.map(mapVoteOption)(a.voteOptions || []),
});

export const postAction:
    (action: ServerType<EditableAction<ActionType>>)
        => Promise<any> = action =>
        fetch(actionsuri, {
            method: 'POST', body: JSON.stringify(Object.assign(action, { type: ActionTypesMap[action.type] }))
        });

export const putAction:
    (action: ServerType<Action<ActionType>>)
        => Promise<any> = action =>
        fetch(actionsuri, {
            method: 'PUT', body: JSON.stringify(Object.assign(action, { type: ActionTypesMap[action.type] }))
        })


export const deleteAction: (id: number) => Promise<any> =
    (id) => {
        const params = new URLSearchParams();
        params.set("id", id.toString());
        return fetch(actionsuri + "?" + params.toString(), { method: 'DELETE' })
    }