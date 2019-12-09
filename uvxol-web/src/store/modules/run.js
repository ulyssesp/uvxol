var Run_1;
import { __decorate } from "tslib";
import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, getModule } from 'vuex-module-decorators';
import store from '@/store';
import eventStore from './events';
import { task, array, set, eq, option, semigroup, ord, nonEmptyArray, tuple } from 'fp-ts';
import { flow, constVoid, constant, identity } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/lib/pipeable';
import { logid } from '../../utils/fp-utils';
import * as fld from 'fp-ts/lib/Foldable';
import { getFilterableComposition } from 'fp-ts/lib/Filterable';
const eqActionEvent = eq.eq.contramap(eq.eqNumber, (e) => e.id);
const seqT = array.array.sequence(task.task);
const seqTSeq = array.array.sequence(task.taskSeq);
const tseq = ta => fld.traverse_(task.taskSeq, array.array)(ta, task.map(constVoid));
const tparallel = ta => fld.traverse_(task.task, array.array)(ta, task.map(constVoid));
const taskFilter = getFilterableComposition(task.task, array.array);
let Run = Run_1 = class Run extends VuexModule {
    constructor() {
        super(...arguments);
        this.runList = [];
        this.chosenVoteOptions = {};
        this.pendingVoteOptions = {};
    }
    get log() {
        return this.runList;
    }
    async start() { }
    async chooseVote(va) {
        return va;
    }
    async restart() {
        return pipe(task.fromIO(() => {
            this.runList = [];
            this.chosenVoteOptions = {};
            this.pendingVoteOptions = {};
        }), task.chain(_ => constant(eventStore.getStartEvents())), task.chain(_ => task.of(eventStore.startEvents)), task.map(set.fromArray(eqActionEvent)), task.chain(flow(Run_1.runEvents(this), array.array.sequence(task.task))))();
    }
    async addVote([v, a]) {
        Vue.set(this.pendingVoteOptions, a, array.cons(v, this.pendingVoteOptions[a] || []));
    }
    async reset() {
        this.runList = [];
        this.chosenVoteOptions = {};
        this.pendingVoteOptions = {};
    }
};
Run.runEvents = self => flow(set.toArray(ord.ord.contramap(ord.ordNumber, e => e.duration)), array.filterMap(Run_1.runEvent(self)));
Run.runEvent = self => flow(option.fromNullable, option.chainFirst(e => pipe(array.getMonoid()
    .concat(array.map((d) => self.chosenVoteOptions[d.id] !== undefined)(e.dependencies), array.map((d) => self.chosenVoteOptions[d.id] === undefined)(e.preventions)), ds => semigroup.fold(semigroup.semigroupAll)(true, ds), option.fromPredicate(identity))), option.map(e => [
    () => eventStore.getEventsForTrigger(e.id).then(constVoid),
    tseq([
        pipe(task.fromIO(() => { self.runList.push(e); }), task.delay(e.delay || 0)),
        pipe([
            pipe(e.actions, array.map(a => task.fromIO(() => option.fromNullable(self.pendingVoteOptions[a.id]))), seqT, ts => taskFilter.filterMap(ts, identity), ts => taskFilter.filterMap(ts, flow(array.sort(ord.ordNumber), array.chop(as => {
                const { init, rest } = array.spanLeft((a) => eq.eqNumber.equals(a, as[0]))(as);
                return [init, rest];
            }), logid(array.array), array.map(arr => [arr[0], arr.length]), nonEmptyArray.fromArray, option.map(nonEmptyArray.max(ord.ord.contramap(ord.ordNumber, e => e[1]))), option.map(tuple.fst), option.map(r => task.fromIO(() => { Vue.set(self.chosenVoteOptions, r, r); })))), task.chain(tparallel)),
            pipe(task.fromIO(() => option.fromNullable(eventStore.eventsByTrigger[e.id])), task.map(option.getOrElse(constant(set.empty))), task.map(set.filterMap(eqActionEvent)(id => option.fromNullable(eventStore.events[id]))), task.chain(flow(Run_1.runEvents(self), tseq)))
        ], tseq, task.delay(e.duration || 0)),
    ]),
]), option.map(tparallel));
__decorate([
    Action({ commit: 'restart', rawError: true })
], Run.prototype, "start", null);
__decorate([
    Action({ commit: 'addVote', rawError: true })
], Run.prototype, "chooseVote", null);
__decorate([
    Mutation
], Run.prototype, "restart", null);
__decorate([
    Mutation
], Run.prototype, "addVote", null);
__decorate([
    Mutation
], Run.prototype, "reset", null);
Run = Run_1 = __decorate([
    Module({ dynamic: true, name: 'runStore', store })
], Run);
export default getModule(Run);
//# sourceMappingURL=run.js.map