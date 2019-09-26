import * as api from '../../api/Actions';
import * as vmod from 'vuex-module-decorators';
import { Action, VoteOptionId } from '@/types';
import { store } from '@/store';
import {array} from 'fp-ts';

@vmod.Module({ dynamic: true, name: 'actionStore', store })
export default class Actions extends vmod.VuexModule {
  public actionList: Action[] = [];

  @vmod.Action({ commit: 'addAction' })
  public async createAction(name: string, filePath: string, type: number,
                            location: string, voteOptions: VoteOptionId[], text: string) {
    return api.postAction(name, filePath, type, location, voteOptions, text);
  }

  @vmod.Action({ commit: 'removeAction' })
  public async deleteAction(id: number) {
    return api.deleteAction(id).then(() => id);
  }

  @vmod.MutationAction({ mutate: ['actionList']})
  public async getActions() {
    return api.getActions().then((actionList: Action[]) => ({ actionList }));
  }

  @vmod.Mutation
  public async addAction(e: Action) {
    return this.actionList.push(e);
  }

  @vmod.Mutation
  public async removeAction(id: number) {
    array.filter((a: Action) => a.id !== id)(this.actionList);
  }
}
