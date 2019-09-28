import * as api from '../../api/Actions';
import * as vmod from 'vuex-module-decorators';
import { Action, VoteOptionId, TypesActionMap } from '@/types';
import {array, task} from 'fp-ts';
import Vue from 'vue';
import store from '@/store';
import { pipe } from 'fp-ts/lib/pipeable';

@vmod.Module({ dynamic: true, name: 'actionStore', store })
class Actions extends vmod.VuexModule {
  public actionsDict: { [id: number]: Action } = {};

  get actionsList() {
    return Object.values(this.actionsDict);
  }

  @vmod.Action({ commit: 'addAction', rawError: true })
  public async createAction(a: {name: string, filePath: string, type: string,
                            location: string, voteOptions: VoteOptionId[], text: string}) {
    return api.postAction(a.name, a.filePath, a.type, a.location, a.voteOptions, a.text);
  }

  @vmod.Action({ commit: 'removeAction', rawError: true })
  public async deleteAction(id: number) {
    return api.deleteAction(id).then(() => id);
  }

  @vmod.Action({ commit: 'addActions', rawError: true })
  public async getActions() {
    return api.getActions()
  }

  @vmod.Mutation
  public async addActions(as: Action[]) {
    return pipe(as, array.map(a => async () => { Vue.set(this.actionsDict, a.id, a) }), array.array.sequence(task.task))();
  }

  @vmod.Mutation
  public async addAction(a: Action) {
    Vue.set(this.actionsDict, a.id, a) 
  }

  @vmod.Mutation
  public async removeAction(id: number) {
    delete this.actionsDict[id];
  }
}

export default vmod.getModule(Actions);
