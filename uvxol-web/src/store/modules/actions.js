import { __decorate } from "tslib";
import * as api from '../../api/Actions';
import * as vmod from 'vuex-module-decorators';
import { array, task } from 'fp-ts';
import Vue from 'vue';
import store from '@/store';
import { pipe } from 'fp-ts/lib/pipeable';
let Actions = class Actions extends vmod.VuexModule {
    constructor() {
        super(...arguments);
        this.actionsDict = {};
    }
    get actionsList() {
        return Object.values(this.actionsDict);
    }
    async createAction(a) {
        return api.postAction(a.name, a.filePath, a.type, a.location, a.voteOptions, a.text);
    }
    async deleteAction(id) {
        return api.deleteAction(id).then(() => id);
    }
    async getActions() {
        return api.getActions();
    }
    async addActions(as) {
        return pipe(as, array.map(a => async () => { Vue.set(this.actionsDict, a.id, a); }), array.array.sequence(task.task))();
    }
    async addAction(a) {
        Vue.set(this.actionsDict, a.id, a);
    }
    async removeAction(id) {
        delete this.actionsDict[id];
    }
};
__decorate([
    vmod.Action({ commit: 'addAction', rawError: true })
], Actions.prototype, "createAction", null);
__decorate([
    vmod.Action({ commit: 'removeAction', rawError: true })
], Actions.prototype, "deleteAction", null);
__decorate([
    vmod.Action({ commit: 'addActions', rawError: true })
], Actions.prototype, "getActions", null);
__decorate([
    vmod.Mutation
], Actions.prototype, "addActions", null);
__decorate([
    vmod.Mutation
], Actions.prototype, "addAction", null);
__decorate([
    vmod.Mutation
], Actions.prototype, "removeAction", null);
Actions = __decorate([
    vmod.Module({ dynamic: true, name: 'actionStore', store })
], Actions);
export default vmod.getModule(Actions);
//# sourceMappingURL=actions.js.map