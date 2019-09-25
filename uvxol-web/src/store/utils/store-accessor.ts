import { Store } from 'vuex';
import Events from '../modules/events';
import {getModule} from 'vuex-module-decorators';

let eventStore: Events;

const initialize = (store: Store<any>): void => {
  eventStore = getModule(Events, store)
}

export {
  initialize,
  eventStore
}
