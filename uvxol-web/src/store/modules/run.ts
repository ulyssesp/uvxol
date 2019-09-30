import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent, EventId, VoteOption, VoteOptionId } from '@/types';
import store from '@/store';
import eventStore from './events';
import { task, array, set, eq, option, semigroup, ord } from 'fp-ts';
import { flow, constVoid, constant, identity } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/lib/pipeable';


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
            array.map((d: VoteOption) => set.elem(eq.eqNumber)(d.id, self.chosenVoteOptions))(e.dependencies),
            array.map((d: VoteOption) => !set.elem(eq.eqNumber)(d.id, self.chosenVoteOptions))(e.preventions),
          ),
        ds => semigroup.fold(semigroup.semigroupAll)(true, ds),
        option.fromPredicate(identity)
      )),
      option.map(e => [
        () => eventStore.getEventsForTrigger(e.id).then(constVoid),
        pipe(
          array.array.sequence(task.taskSeq)([
            pipe(task.fromIO(() => { self.runList.push(e); }), task.delay(e.delay || 0)),
            pipe(
              async () => eventStore.eventsByTrigger[e.id],
              task.chain(flow(Run.runEvents(self), array.array.sequence(task.task))),
              task.map(constVoid),
              task.delay(e.duration))
          ]),
          task.map(constVoid)
        )
      ]),
      option.map(flow(array.array.sequence(task.task), task.map(constVoid))),
    );

  static reset: (self: any) => task.Task<any> = self => async () => {
    self.runlist = [];
    self.chosenVoteOptions.clear();
  };

  public runList: ActionEvent[] = [];
  public chosenVoteOptions: Set<VoteOptionId> = new Set();

  @Action({ commit: 'runEvents', rawError: true })
  public async start() {
    return pipe(
      Run.reset(this),
      task.chain(_ => constant(eventStore.getStartEvents())),
      task.chain(_ => task.of(eventStore.startEvents)))()
  }

  @Action({ commit: 'addVote', rawError: true })
  public async chooseVote(v: VoteOptionId) {
    return v;
  }

  @Mutation
  public async runEvents(es: ActionEvent[]) {
    return pipe(
      es, 
      set.fromArray(eq.eq.contramap(eq.eqNumber, e => e.id)),
      Run.runEvents(this),
      array.array.sequence(task.task)
    )();
  }

  @Mutation
  public async addVote(v: VoteOptionId) {
    this.chosenVoteOptions.add(v);
  }
}

export default getModule(Run);
