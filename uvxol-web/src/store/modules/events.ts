import * as api from '../../api/Events'
import { Module, VuexModule, Action, Mutation, MutationAction } from 'vuex-module-decorators';
import { ActionEvent } from '@/types';
import store from '@/store'

export interface IEventStoreState {
  events: ActionEvent[]
}

@Module({ dynamic: true, name: 'eventStore', store })
export default class Events extends VuexModule {
  events: ActionEvent[] = []

  @Action({ commit: 'addEvent' })
  async postEvent(name: string, triggers: number[], duration: number, delay: number, actions: number[]) { 
    return api.postEvent(name, triggers, duration, delay, actions);
  }

  @MutationAction({ mutate: ['events']})
  public async getEvents() {
    return api.getEvents().then((events: ActionEvent[]) => ({ events }));
  }

  @Mutation
  async addEvent(e: ActionEvent) {
    return this.events.push(e);
  }
}
