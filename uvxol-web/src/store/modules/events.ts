import * as api from '../../api/Events'
import { Module, VuexModule, Action, Mutation, MutationAction } from 'vuex-module-decorators';
import { ActionEvent } from '@/types';
import store from '@/store'
import {array} from 'fp-ts';

export interface IEventStoreState {
  events: ActionEvent[]
}

@Module({ dynamic: true, name: 'eventStore', store })
export default class Events extends VuexModule {
  events: ActionEvent[] = []

  @Action({ commit: 'addEvent' })
  async createEvent(name: string, triggers: number[], duration: number, delay: number, actions: number[]) { 
    return api.postEvent(name, triggers, duration, delay, actions);
  }

  @Action({ commit: 'removeEvent' })
  async deleteEvent(id: number) {
    return api.deleteEvent(id);
  }

  @MutationAction({ mutate: ['events']})
  public async getEvents() {
    return api.getEvents().then((events: ActionEvent[]) => ({ events }));
  }

  @Mutation
  async addEvent(e: ActionEvent) {
    return this.events.push(e);
  }

  @Mutation
  async removeEvent(removeEvent: ActionEvent) {
    array.filter((e: ActionEvent) => e.id !== removeEvent.id)(this.events);
  }

}
