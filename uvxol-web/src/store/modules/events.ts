import * as api from '../../api/Events';
import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent, EventId } from '@/types';
import store from '@/store';
import { array, task, set } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { constant, flow } from 'fp-ts/lib/function';


@Module({ dynamic: true, name: 'eventStore', store })
class Events extends VuexModule {
  public events: { [id: number] : ActionEvent } = {};
  public eventsByTrigger: { [id: number]: Set<ActionEvent> } = {};

  static addEvent: (self: any) => (e: ActionEvent) => Promise<any> = (self: any) =>
    flow(
      task.of,
      task.chainFirst(e => async () =>  { Vue.set(self.events, e.id, e) }),
      task.chainFirst(e => 
        pipe(e.triggers, array.map(triggerId => async () => Vue.set(self.eventsByTrigger, triggerId, e.id)),
          array.array.sequence(task.task))),
      t => t()
    );

  get eventsList() {
    return Object.values(this.events);
  }

  get startEvents() {
    return array.filter((e: ActionEvent) => e.triggers.length == 0)(Object.values(this.events));
  }

  @Action({ commit: 'addEventAction' , rawError: true })
  public async createEvent(a: { name: string, triggers: number[], duration: number, delay: number, actions: number[]}) {
    return api.postEvent(a.name, a.triggers, a.duration, a.delay, a.actions);
  }

  @Action({ commit: 'removeEvent' , rawError: true })
  public async deleteEvent(id: number) {
    return api.deleteEvent(id).then(() => id);
  }

  @Action({commit: 'addEventsAction', rawError: true })
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

  @Action({ commit: 'addEventsAction', rawError: true })
  public async getEventsForTrigger(id: number) {
    console.log(id);
    return api.getEventsForTrigger(id);
  }

  @Mutation
  public async addEventsAction(es: ActionEvent[]) {
    return pipe(es, array.map(flow(Events.addEvent(this), constant)), array.array.sequence(task.task))();
  }

  @Mutation
  public async addEventAction(e: ActionEvent) {
    await Events.addEvent(this)(e);
  }

  @Mutation
  public async removeEvent(id: number) {
    delete this.events[id];
  }
}


export default getModule(Events);
