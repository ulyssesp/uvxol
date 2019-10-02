import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent, EventId, VoteOption, VoteOptionId, ActionId } from '@/types';
import store from '@/store';
import eventStore from './events';
import { task, array, set, eq, option, semigroup, ord, nonEmptyArray, tuple } from 'fp-ts';
import { flow, constVoid, constant, identity } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/lib/pipeable';
import { logid, logval } from '../../utils/fp-utils';
import * as idt from 'fp-ts/lib/Identity';
import * as cnst from 'fp-ts/lib/Const';
import * as trv from 'fp-ts/lib/Traversable';
import * as fld from 'fp-ts/lib/Foldable';
import * as ap from 'fp-ts/lib/Applicative';
import { getFilterableComposition } from 'fp-ts/lib/Filterable';

const eqActionEvent = eq.eq.contramap(eq.eqNumber, (e: ActionEvent) => e.id);
const seqT = array.array.sequence(task.task);
const seqTSeq = array.array.sequence(task.taskSeq);
const tseq: <A>(ta: task.Task<A>[]) => task.Task<void> = 
  ta => fld.traverse_(task.taskSeq, array.array)(ta, task.map(constVoid))
const tparallel: <A>(ta: task.Task<A>[]) => task.Task<void> = 
  ta => fld.traverse_(task.task, array.array)(ta, task.map(constVoid))

const taskFilter = getFilterableComposition(task.task, array.array);

@Module({ dynamic: true, name: 'runStore', store })
class Run extends VuexModule {
  static runEvents: (self: Run) => (es: Set<ActionEvent>) => task.Task<void>[] = self =>
    flow(
      set.toArray(ord.ord.contramap(ord.ordNumber, e => e.duration)),
      array.filterMap(Run.runEvent(self)),
   )

  static runEvent: (self: Run) => (e: ActionEvent) => option.Option<task.Task<void>> = self =>
    flow(
      option.fromNullable,
      option.chainFirst(e => pipe(
        array.getMonoid<boolean>()
          .concat(
            array.map((d: VoteOption) => self.chosenVoteOptions[d.id] !== undefined)(e.dependencies),
            array.map((d: VoteOption) => self.chosenVoteOptions[d.id] === undefined)(e.preventions),
          ),
        ds => semigroup.fold(semigroup.semigroupAll)(true, ds),
        option.fromPredicate(identity),
      )),
      option.map(e => [
          () => eventStore.getEventsForTrigger(e.id).then(constVoid),
          tseq([
            pipe(task.fromIO(() => { self.runList.push(e); }), task.delay(e.delay || 0)),
            pipe([
                pipe(
                  e.actions,
                  array.map(a => task.fromIO(() => option.fromNullable(self.pendingVoteOptions[a.id]))),
                  seqT,
                  ts => taskFilter.filterMap(ts, identity),
                  ts => taskFilter.filterMap(ts, flow(
                    array.sort(ord.ordNumber),
                    array.chop(as => {
                      const { init, rest } = array.spanLeft((a: number) => eq.eqNumber.equals(a, as[0]))(as)
                      return [init, rest];
                    }),
                    logid(array.array),
                    array.map(arr => [arr[0], arr.length] as [number, number]),
                    nonEmptyArray.fromArray,
                    option.map(nonEmptyArray.max(ord.ord.contramap(ord.ordNumber, e => e[1]))),
                    option.map(tuple.fst),
                    option.map(r => task.fromIO(() => { Vue.set(self.chosenVoteOptions, r, r) })),
                  )),
                  task.chain(tparallel),
                ),
                pipe(
                  task.fromIO(() => option.fromNullable(eventStore.eventsByTrigger[e.id])),
                  task.map(option.getOrElse(constant(set.empty as Set<number>))),
                  task.map(set.filterMap(eqActionEvent)(id => option.fromNullable(eventStore.events[id]))),
                  task.chain(flow(Run.runEvents(self), tseq)))
              ],
              tseq,
              task.delay(e.duration || 0)
            ),
          ]),
      ]),
      option.map(tparallel),
    )

  public runList: ActionEvent[] = [];
  public chosenVoteOptions: { [id: number]: number } = {};
  public pendingVoteOptions: { [ id: number ] : Array<number> } = {};

  get log() {
    return this.runList;
  }

  @Action({ commit: 'restart', rawError: true })
  public async start() { }

  @Action({ commit: 'addVote', rawError: true })
  public async chooseVote(va: [VoteOptionId, ActionId]) {
    return va;
  }

  @Mutation
  public async restart() {
    return pipe(
      task.fromIO(() => {
        this.runList = [];
        this.chosenVoteOptions = {}
        this.pendingVoteOptions = {};
      }),
      task.chain(_ => constant(eventStore.getStartEvents())),
      task.chain(_ => task.of(eventStore.startEvents)),
      task.map(set.fromArray(eqActionEvent)),
      task.chain(flow(Run.runEvents(this), array.array.sequence(task.task)))
    )();
  }

  @Mutation
  public async addVote([v, a]: [VoteOptionId, ActionId]) {
    Vue.set(this.pendingVoteOptions, a, array.cons(v, this.pendingVoteOptions[a] || []));
  }

  @Mutation
  public async reset() {
    this.runList = [];
    this.chosenVoteOptions = {};
    this.pendingVoteOptions = {};
  }
}

export default getModule(Run);
