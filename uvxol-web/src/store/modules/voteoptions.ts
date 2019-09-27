import * as api from '../../api/VoteOptions';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { VoteOption } from '@/types';
import store from '@/store';
import {array} from 'fp-ts';

@Module({ dynamic: true, name: 'voteOptionStore', store })
class VoteOptions extends VuexModule {
  public voteOptions: VoteOption[] = [];

  @Action({ commit: 'addVoteOption', rawError: true  })
  public async createVoteOption(vo: {name: string, text: string, dependencies: number[], preventions: number[]}) {
    return api.postVoteOption(vo.name, vo.text, vo.dependencies, vo.preventions);
  }

  @Action({ commit: 'removeVoteOption' })
  public async deleteVoteOption(id: number) {
    return api.deleteVoteOption(id).then(() => id);
  }

  @MutationAction({ mutate: ['voteOptions']})
  public async getVoteOptions() {
    return api.getVoteOptions().then((voteOptions: VoteOption[]) => ({ voteOptions }));
  }

  @Mutation
  public async addVoteOption(e: VoteOption) {
    return this.voteOptions.push(e);
  }

  @Mutation
  public async removeVoteOption(id: number) {
    array.filter((e: VoteOption) => e.id !== id)(this.voteOptions);
  }
}

export default getModule(VoteOptions);
