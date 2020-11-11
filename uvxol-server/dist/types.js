"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesActionMap = exports.ActionTypesMap = exports.isVoteEditableAction = exports.isNotVoteAction = exports.isFunMeterAction = exports.actionVoteOptions = exports.isFileAction = exports.isVoteAction = exports.isServerAction = void 0;
function isServerAction(a) {
    return a.id !== undefined;
}
exports.isServerAction = isServerAction;
function isVoteAction(a) {
    return a.type === "vote";
}
exports.isVoteAction = isVoteAction;
function isFileAction(a) {
    return a.type === "video" || a.type === "audio";
}
exports.isFileAction = isFileAction;
function actionVoteOptions(val) {
    return isVoteAction(val) || isFileAction(val) ? val.voteOptions : [];
}
exports.actionVoteOptions = actionVoteOptions;
function isFunMeterAction(a) {
    return a.type === "funMeter";
}
exports.isFunMeterAction = isFunMeterAction;
function isNotVoteAction(a) {
    return a.type !== "vote";
}
exports.isNotVoteAction = isNotVoteAction;
function isVoteEditableAction(a) {
    return a.type === "vote";
}
exports.isVoteEditableAction = isVoteEditableAction;
exports.ActionTypesMap = { audio: 0, video: 1, vote: 2, funMeter: 3 };
exports.TypesActionMap = { 0: 'audio', 1: 'video', 2: 'vote', 3: 'funMeter' };
