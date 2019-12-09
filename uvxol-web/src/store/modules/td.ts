import * as vmod from 'vuex-module-decorators';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import {array, task} from 'fp-ts';
import Vue from 'vue';
import store from '@/store';
import { pipe } from 'fp-ts/lib/pipeable';

@vmod.Module({ dynamic: true, name: 'actionStore', store })
class TD extends vmod.VuexModule {

  @vmod.Action({ commit: 'sendMessage', rawError: true })
  public async sendMessage(message: string) {
    Vue.prototype.$socket.emit(message);
  }

  @Mutation
  public async SOCKET_CONNECT() {
    console.log("connect");
  }
}

export default vmod.getModule(TD);
