"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startVote = exports.getVoteOptions = exports.getActions = exports.getEvents = exports.mapVoteOption = exports.mapAction = exports.mapEvent = exports.startVoteUri = exports.voteOptionsUri = exports.actionsuri = exports.eventsuri = void 0;
const types_1 = require("./types");
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.eventsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/events';
exports.actionsuri = 'https://uvxol-httptrigger.azurewebsites.net/api/actions';
exports.voteOptionsUri = 'https://uvxol-httptrigger.azurewebsites.net/api/voteoptions';
exports.startVoteUri = "https://uvxol-httptrigger.azurewebsites.net/api/twitchVoteOptions";
const mapEvent = (e) => Object.assign(e, {
    actions: (e.actions || []).map(exports.mapAction),
    triggers: (e.triggers || []).map((t) => t.id),
    dependencies: (e.dependencies || []).map(exports.mapVoteOption),
    preventions: (e.preventions || []).map(exports.mapVoteOption),
});
exports.mapEvent = mapEvent;
const mapAction = (a) => Object.assign(a, {
    type: types_1.TypesActionMap[a.type],
    voteOptions: (a.voteOptions || []).map(exports.mapVoteOption),
});
exports.mapAction = mapAction;
const mapVoteOption = (a) => Object.assign(a, {
    dependencies: (a.dependencies || []).map((d) => d.id),
    preventions: (a.preventions || []).map((d) => d.id),
});
exports.mapVoteOption = mapVoteOption;
const getEvents = () => node_fetch_1.default(exports.eventsuri)
    .then((res) => res.json())
    .then((as) => as[0] || [])
    .then((as) => as.map(exports.mapEvent));
exports.getEvents = getEvents;
const getActions = () => node_fetch_1.default(exports.actionsuri)
    .then(res => res.json())
    .then((as) => as[0])
    .then(as => as.map(exports.mapAction));
exports.getActions = getActions;
const getVoteOptions = () => node_fetch_1.default(exports.voteOptionsUri)
    .then(res => res.json())
    .then((as) => as[0])
    .then(vos => vos.map(exports.mapVoteOption));
exports.getVoteOptions = getVoteOptions;
const startVote = (zone, voteOptions) => node_fetch_1.default(exports.startVoteUri, {
    method: "post",
    body: JSON.stringify({ zone, voteOptions })
});
exports.startVote = startVote;
