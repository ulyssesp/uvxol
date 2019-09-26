import * as api from '../../api/Events';
import { Module, VuexModule, Action, Mutation, MutationAction } from 'vuex-module-decorators';
import { ActionEvent } from '@/types';
import { store } from '@/store';
import {array} from 'fp-ts';

@Module({ dynamic: true, name: 'eventStore', store })
export default class Events extends VuexModule {
  public events: ActionEvent[] = [];

  @Action({ commit: 'addEvent' })
  public async createEvent(name: string, triggers: number[], duration: number, delay: number, actions: number[]) {
    return api.postEvent(name, triggers, duration, delay, actions);
  }

  @Action({ commit: 'removeEvent' })
  public async deleteEvent(id: number) {
    return api.deleteEvent(id).then(() => id);
  }

  @MutationAction({ mutate: ['events']})
  public async getEvents() {
    return api.getEvents().then((events: ActionEvent[]) => ({ events }));
  }

  @Mutation
  public async addEvent(e: ActionEvent) {
    return this.events.push(e);
  }

  @Mutation
  public async removeEvent(id: number) {
    array.filter((e: ActionEvent) => e.id !== id)(this.events);
  }
}
