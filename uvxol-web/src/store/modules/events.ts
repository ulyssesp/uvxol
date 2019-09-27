import * as api from '../../api/Events';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent } from '@/types';
import store from '@/store';
import {array} from 'fp-ts';

@Module({ dynamic: true, name: 'eventStore', store })
class Events extends VuexModule {
  public events: ActionEvent[] = [];

  @Action({ commit: 'addEvent' , rawError: true })
  public async createEvent(a: { name: string, triggers: number[], duration: number, delay: number, actions: number[]}) {
    return api.postEvent(a.name, a.triggers, a.duration, a.delay, a.actions);
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


export default getModule(Events);
