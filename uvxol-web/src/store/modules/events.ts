import * as api from '../../api/Events';
import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent, EventId, isVoteAction } from '@/types';
import store from '@/store';
import { array, task, set, eq, foldable } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { constant, constVoid, flow, identity } from 'fp-ts/lib/function';
import voteOptionStore from './voteoptions';

import { logid, logval } from '../../utils/fp-utils';

const storeVoteOptions: (a: ActionEvent[]) => task.Task<ActionEvent[]> = es => pipe(
  es,
  array.chain(e => e.actions),
  array.chain(a => isVoteAction(a) ? a.voteOptions : []),
  task.of,
  task.chainFirst(flow(voteOptionStore.insertVoteOptions, constant)),
  task.chain(constant(task.of(es)))
);


@Module({ dynamic: true, name: 'eventStore', store })
class Events extends VuexModule {
  public events: { [id: number]: ActionEvent } = {};
  public eventsByTrigger: { [id: number]: Set<number> } = {};

  static addEvent: (self: Events) => (e: ActionEvent) => Promise<ActionEvent> = (self: Events) =>
    flow(
      task.of,
      task.chainFirst(e => async () => { Vue.set(self.events, e.id, e) }),
      task.chainFirst(e =>
        pipe(e.triggers,
          array.map(triggerId => async () => {
            Vue.set(self.eventsByTrigger, triggerId,
              set.union(eq.eqNumber)(self.eventsByTrigger[triggerId] || set.empty, set.singleton(e.id)))
          }),
          arr => foldable.traverse_(task.task, array.array)(arr, task.map(constVoid)))),
      t => t()
    );

  get eventsList() {
    return Object.values(this.events);
  }

  @Action({ commit: 'addEventAction', rawError: true })
  public async createOrUpdateEvent(a: {
    id: number | undefined, name: string,
    triggers: number[], duration: number,
    delay: number, actions: number[],
    dependencies: number[], preventions: number[]
  }) {
    return a.id === undefined ?
      api.postEvent(a.name, a.triggers, a.duration, a.delay, a.actions, a.dependencies, a.preventions) :
      api.putEvent(a.id, a.name, a.triggers, a.duration, a.delay, a.actions, a.dependencies, a.preventions);
  }

  @Action({ commit: 'removeEvent', rawError: true })
  public async deleteEvent(id: number) {
    return api.deleteEvent(id).then(() => id);
  }

  @Action({ commit: 'addEventsAction', rawError: true })
  public async fetchForTrigger(trigger: EventId) {
    return api.getEventsForTrigger(trigger);
  }

  @Action({ commit: 'addEventsAction', rawError: true })
  public async getEvents() {
    return api.getEvents();
  }

  @Action({ commit: 'addEventsAction', rawError: true })
  public async getStartEvents() {
    return api.getStartEvents();
  }

  @Action({ commit: 'addEventAction', rawError: true })
  public async getEvent(id: number) {
    return api.getEvent(id);
  }

  @Action({ commit: 'addEventsAction', rawError: true })
  public async getEventsForTrigger(id: number) {
    return api.getEventsForTrigger(id);
  }

  @Mutation
  public async addEventsAction(es: ActionEvent[]) {
    return pipe(
      es,
      array.map(flow(Events.addEvent(this), constant)),
      array.array.sequence(task.task),
      task.chainFirst(storeVoteOptions)
    )();
  }

  @Mutation
  public async addEventAction(e: ActionEvent) {
    await Events.addEvent(this)(Object.assign({ dependencies: [], preventions: [] }, e));
  }

  @Mutation
  public async removeEvent(id: number) {
    delete this.events[id];
  }
}


export default getModule(Events);
