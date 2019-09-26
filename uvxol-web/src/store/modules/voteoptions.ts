import * as api from '../../api/VoteOptions';
import { Module, VuexModule, Action, Mutation, MutationAction } from 'vuex-module-decorators';
import { VoteOption } from '@/types';
import { store } from '@/store';
import {array} from 'fp-ts';

@Module({ dynamic: true, name: 'voteOptionStore', store })
export default class VoteOptions extends VuexModule {
  public voteOptions: VoteOption[] = [];

  @Action({ commit: 'addVoteOption' })
  public async createVoteOption(name: string, text: string, dependencies: number[], preventions: number[]) {
    return api.postVoteOption(name, text, dependencies, preventions);
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
