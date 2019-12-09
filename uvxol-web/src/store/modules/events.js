var Events_1;
import { __decorate } from "tslib";
import * as api from '../../api/Events';
import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, getModule } from 'vuex-module-decorators';
import store from '@/store';
import { array, task, set, eq } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { constant, flow } from 'fp-ts/lib/function';
import voteOptionStore from './voteoptions';
import { logid } from '../../utils/fp-utils';
const storeVoteOptions = es => pipe(es, array.chain(e => e.actions), array.chain(a => a.voteOptions || []), task.of, logid(task.task), task.chainFirst(flow(voteOptionStore.insertVoteOptions, constant)), task.chain(constant(task.of(es))));
let Events = Events_1 = class Events extends VuexModule {
    constructor() {
        super(...arguments);
        this.events = {};
        this.eventsByTrigger = {};
    }
    get eventsList() {
        return Object.values(this.events);
    }
    get startEvents() {
        return array.filter((e) => e.triggers.length == 0)(Object.values(this.events));
    }
    async createEvent(a) {
        return api.postEvent(a.name, a.triggers, a.duration, a.delay, a.actions, a.dependencies, a.preventions);
    }
    async deleteEvent(id) {
        return api.deleteEvent(id).then(() => id);
    }
    async fetchForTrigger(trigger) {
        return api.getEventsForTrigger(trigger);
    }
    async getEvents() {
        return api.getEvents();
    }
    async getStartEvents() {
        return api.getStartEvents();
    }
    async getEventsForTrigger(id) {
        return api.getEventsForTrigger(id);
    }
    async addEventsAction(es) {
        return pipe(es, array.map(flow(Events_1.addEvent(this), constant)), array.array.sequence(task.task), task.chainFirst(storeVoteOptions))();
    }
    async addEventAction(e) {
        await Events_1.addEvent(this)(e);
    }
    async removeEvent(id) {
        delete this.events[id];
    }
};
Events.addEvent = (self) => flow(task.of, task.chainFirst(e => async () => { Vue.set(self.events, e.id, e); }), task.chainFirst(e => pipe(e.triggers, array.map(triggerId => async () => {
    Vue.set(self.eventsByTrigger, triggerId, set.union(eq.eqNumber)(self.eventsByTrigger[triggerId] || set.empty, set.singleton(e.id)));
}), array.array.sequence(task.task))), t => t());
__decorate([
    Action({ commit: 'addEventAction', rawError: true })
], Events.prototype, "createEvent", null);
__decorate([
    Action({ commit: 'removeEvent', rawError: true })
], Events.prototype, "deleteEvent", null);
__decorate([
    Action({ commit: 'addEventsAction', rawError: true })
], Events.prototype, "fetchForTrigger", null);
__decorate([
    Action({ commit: 'addEventsAction', rawError: true })
], Events.prototype, "getEvents", null);
__decorate([
    Action({ commit: 'addEventsAction', rawError: true })
], Events.prototype, "getStartEvents", null);
__decorate([
    Action({ commit: 'addEventsAction', rawError: true })
], Events.prototype, "getEventsForTrigger", null);
__decorate([
    Mutation
], Events.prototype, "addEventsAction", null);
__decorate([
    Mutation
], Events.prototype, "addEventAction", null);
__decorate([
    Mutation
], Events.prototype, "removeEvent", null);
Events = Events_1 = __decorate([
    Module({ dynamic: true, name: 'eventStore', store })
], Events);
export default getModule(Events);
//# sourceMappingURL=events.js.map