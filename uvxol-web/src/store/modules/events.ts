import * as api from '../../api/Events';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent, EventId } from '@/types';
import store from '@/store';
import { array, task } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import Vue from 'vue';

@Module({ dynamic: true, name: 'eventStore', store })
class Events extends VuexModule {
  public events: { [id: number] : ActionEvent } = {};

  get eventsList() {
    console.log(Object.values(this.events));
    return Object.values(this.events);
  }

  @Action({ commit: 'addEvent' , rawError: true })
  public async createEvent(a: { name: string, triggers: number[], duration: number, delay: number, actions: number[]}) {
    return api.postEvent(a.name, a.triggers, a.duration, a.delay, a.actions);
  }

  @Action({ commit: 'removeEvent' , rawError: true })
  public async deleteEvent(id: number) {
    return api.deleteEvent(id).then(() => id);
  }

  @Action({commit: 'addEvents', rawError: true })
  public async fetchForTrigger(trigger: EventId) {
    return api.getEventsForTrigger(trigger);
  }

  @Action({ commit: 'addEvents', rawError: true })
  public async getEvents() {
    return api.getEvents();
  }

  @Mutation
  public async addEvents(es: ActionEvent[]) {
    pipe(es, array.map(e => async () => { Vue.set(this.events, e.id, e) }), array.array.sequence(task.task))();
  }

  @Mutation 
  public async addEvent(e: ActionEvent) {
    console.log(JSON.stringify(e));
     Vue.set(this.events, e.id, e);
  }


  @Mutation
  public async removeEvent(id: number) {
    delete this.events[id];
  }
}


export default getModule(Events);
