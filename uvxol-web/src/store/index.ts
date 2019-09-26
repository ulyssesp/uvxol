import Vue from 'vue';
import Vuex, { Store } from 'vuex';
// import { mutations } from './mutations'
// import actions from './actions';
// import plugins from './plugins'
import Events, { IEventStoreState } from './modules/events';
import { initialize } from './utils/store-accessor';
import { ActionEvent } from '../types';
Vue.use(Vuex);

// const initializer = (store: Store<any>) => initialize(store);
// const plugins = [initializer];


export {
  store: new Vuex.Store({})
}
  // modules: {
  //   eventStore: Events
  // },
  // actions,
  // mutations,
  // state: {
  //   eventStore: {
  //     events: []
  //   }
  // },
  // plugins
//});

// const eventStore = getModule(Events, store);


// export {
//   store,
//   eventStore
// }
