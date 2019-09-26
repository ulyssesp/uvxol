import Vue from 'vue';
import Vuex from 'vuex';
import Events from './modules/events';
import Actions from './modules/actions';
import VoteOptions from './modules/voteoptions';
import { getModule } from 'vuex-module-decorators';

Vue.use(Vuex);

export const store = new Vuex.Store({});
export const eventStore = getModule(Events);
export const actionStore = getModule(Actions);
export const voteOptionStore = getModule(VoteOptions);
