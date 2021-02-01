import * as api from '../../api/VoteOptions';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { VoteOption } from '@/types';
import store from '@/store';
import { array, task } from 'fp-ts';
import Vue from 'vue';
import { pipe } from 'fp-ts/lib/pipeable';

@Module({ dynamic: true, name: 'voteOptionStore', store })
class VoteOptions extends VuexModule {
  public voteOptions: { [id: number]: VoteOption } = {};

  get voteOptionsList() {
    return Object.values(this.voteOptions);
  }

  @Action({ commit: 'addVoteOption', rawError: true })
  public async createOrUpdateVoteOption(vo: { id: number | undefined, shortname: string, name: string, text: string, dependencies: number[], preventions: number[], funRequirement: number | undefined, budgetRequirement: number | undefined }): Promise<VoteOption> {
    return vo.id === undefined
      ? api.postVoteOption(vo.name, vo.shortname, vo.text, vo.funRequirement, vo.budgetRequirement, vo.dependencies, vo.preventions)
      : api.putVoteOption(vo.id, vo.name, vo.shortname, vo.text, vo.funRequirement, vo.budgetRequirement, vo.dependencies, vo.preventions)
  }

  @Action({ commit: 'removeVoteOption', rawError: true })
  public async deleteVoteOption(id: number) {
    return api.deleteVoteOption(id).then(() => id);
  }

  @Action({ commit: 'addVoteOptions', rawError: true })
  public async getVoteOptions() {
    return api.getVoteOptions();
  }

  @Action({ commit: 'addVoteOptions', rawError: true })
  public async insertVoteOptions(vos: VoteOption[]) {
    return vos;
  }

  @Mutation
  public async addVoteOptions(vos: VoteOption[]) {
    pipe(vos, array.map(vo => async () => { Vue.set(this.voteOptions, vo.id, vo); }),
      array.array.sequence(task.task))();
  }

  @Mutation
  public async addVoteOption(vo: VoteOption) {
    Vue.set(this.voteOptions, vo.id, vo);
  }

  @Mutation
  public async removeVoteOption(id: number) {
    Vue.delete(this.voteOptions, id);
  }
}

export default getModule(VoteOptions);
