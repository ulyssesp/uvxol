import { __decorate } from "tslib";
import * as api from '../../api/VoteOptions';
import { Module, VuexModule, Action, Mutation, getModule } from 'vuex-module-decorators';
import store from '@/store';
import { array, task } from 'fp-ts';
import Vue from 'vue';
import { pipe } from 'fp-ts/lib/pipeable';
let VoteOptions = class VoteOptions extends VuexModule {
    constructor() {
        super(...arguments);
        this.voteOptions = {};
    }
    get voteOptionsList() {
        return Object.values(this.voteOptions);
    }
    async createVoteOption(vo) {
        return api.postVoteOption(vo.name, vo.text, vo.dependencies, vo.preventions).then(res => res[0][0]);
    }
    async deleteVoteOption(id) {
        return api.deleteVoteOption(id).then(() => id);
    }
    async getVoteOptions() {
        return api.getVoteOptions();
    }
    async insertVoteOptions(vos) {
        return vos;
    }
    async addVoteOptions(vos) {
        pipe(vos, array.map(vo => async () => { Vue.set(this.voteOptions, vo.id, vo); }), array.array.sequence(task.task))();
    }
    async addVoteOption(vo) {
        Vue.set(this.voteOptions, vo.id, vo);
    }
    async removeVoteOption(id) {
        Vue.delete(this.voteOptions, id);
    }
};
__decorate([
    Action({ commit: 'addVoteOption', rawError: true })
], VoteOptions.prototype, "createVoteOption", null);
__decorate([
    Action({ commit: 'removeVoteOption', rawError: true })
], VoteOptions.prototype, "deleteVoteOption", null);
__decorate([
    Action({ commit: 'addVoteOptions', rawError: true })
], VoteOptions.prototype, "getVoteOptions", null);
__decorate([
    Action({ commit: 'addVoteOptions', rawError: true })
], VoteOptions.prototype, "insertVoteOptions", null);
__decorate([
    Mutation
], VoteOptions.prototype, "addVoteOptions", null);
__decorate([
    Mutation
], VoteOptions.prototype, "addVoteOption", null);
__decorate([
    Mutation
], VoteOptions.prototype, "removeVoteOption", null);
VoteOptions = __decorate([
    Module({ dynamic: true, name: 'voteOptionStore', store })
], VoteOptions);
export default getModule(VoteOptions);
//# sourceMappingURL=voteoptions.js.map