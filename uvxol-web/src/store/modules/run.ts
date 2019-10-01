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


@Module({ dynamic: true, name: 'runStore', store })
class Run extends VuexModule {
  static runEvents: (self: Run) => (es: Set<ActionEvent>) => task.Task<void>[] = self =>
    flow(
      set.toArray(ord.ord.contramap(ord.ordNumber, e => e.duration)),
      array.map(Run.runEvent(self)),
      array.array.sequence(option.option),
      option.getOrElse<task.Task<void>[]>(constant([]))
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
        logval(option.option)(e.name)
      )),
      option.map(e => {
        console.log("here" + e.name);
        return [
          async () => console.log("Running " + e.name),
          () => eventStore.getEventsForTrigger(e.id).then(constVoid),
          pipe(
            array.array.sequence(task.taskSeq)([
              pipe(task.fromIO(() => { self.runList.push(e); }), task.delay(e.delay || 0)),
              pipe(
                async () => option.fromNullable(eventStore.eventsByTrigger[e.id]),
                  task.chain(_ => task.fromIO(() => pipe(
                  e.actions, 
                  array.filterMap(a => option.fromNullable(self.pendingVoteOptions[a.id])),
                  array.filterMap(flow(
                    array.sort(ord.ordNumber), 
                    array.chop(as => {
                      const { init, rest } = array.spanLeft((a: number) => eq.eqNumber.equals(a, as[0]))(as)
                      return [init, rest];
                    }),
                    array.map(arr => [arr[0], arr.length] as [number, number]),
                    nonEmptyArray.fromArray,
                    option.map(nonEmptyArray.max(ord.ord.contramap(ord.ordNumber, e => e[1]))),
                    option.map(tuple.fst),
                    option.map(r => Vue.set(self.chosenVoteOptions, r, r)),
                  )),
                ))),
                task.map(option.map(
                  set.filterMap(eq.eq.contramap(eq.eqNumber, (e: ActionEvent) => e.id))
                      (id => option.fromNullable(eventStore.events[id])))),
                task.map(option.getOrElse(constant(set.empty as Set<ActionEvent>))),
                task.chain(flow(Run.runEvents(self), array.array.sequence(task.taskSeq))),
                task.map(constVoid),
                task.delay(e.duration))
            ]),
            task.map(constVoid)
          )
        ];}),
      logid(option.option),
      option.map(flow(array.array.sequence(task.taskSeq), task.map(constVoid))),
    );

  static reset: (self: any) => task.Task<any> = self => async () => {
    self.runList = [];
  };

  public runList: ActionEvent[] = [];
  public chosenVoteOptions: { [id: number]: number } = {};
  public pendingVoteOptions: { [ id: number ] : Array<number> } = {};

  get log() {
    return this.runList;
  }

  @Action({ commit: 'restart', rawError: true })
  public async start() {
  }

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
      }),
      task.chain(_ => constant(eventStore.getStartEvents())),
      task.chain(_ => task.of(eventStore.startEvents)),
      task.map(set.fromArray(eq.eq.contramap(eq.eqNumber, e => e.id))),
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
  }
}

export default getModule(Run);
