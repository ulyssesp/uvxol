import * as request from 'request-promise-native';
import { array } from 'fp-ts';
export const voteOptionsUri = 'https://uvxol-httptrigger.azurewebsites.net/api/voteoptions';
export const getVoteOptions = () => request.get({ url: voteOptionsUri, json: true })
    .then((as) => as[0])
    .then(array.map(mapVoteOption));
export const getEventVoteOptions = () => request.get({ url: voteOptionsUri, json: true })
    .then((as) => as[0])
    .then(array.map(mapVoteOption));
export const mapVoteOption = (a) => Object.assign(a, {
    dependencies: array.map((d) => d.id)(a.dependencies || []),
    preventions: array.map((d) => d.id)(a.preventions || []),
});
export const postVoteOption = (name, text, dependencies, preventions) => request.post({ url: voteOptionsUri, json: true, body: { name, text, dependencies, preventions } }).promise();
export const deleteVoteOption = (id) => request.delete({ url: voteOptionsUri, qs: { id } }).promise();
//# sourceMappingURL=VoteOptions.js.map