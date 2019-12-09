import { __decorate } from "tslib";
import * as vmod from 'vuex-module-decorators';
import { Mutation } from 'vuex-module-decorators';
import Vue from 'vue';
import store from '@/store';
let TD = class TD extends vmod.VuexModule {
    async sendMessage(message) {
        Vue.prototype.$socket.emit(message);
    }
    async SOCKET_CONNECT() {
        console.log("connect");
    }
};
__decorate([
    vmod.Action({ commit: 'sendMessage', rawError: true })
], TD.prototype, "sendMessage", null);
__decorate([
    Mutation
], TD.prototype, "SOCKET_CONNECT", null);
TD = __decorate([
    vmod.Module({ dynamic: true, name: 'actionStore', store })
], TD);
export default vmod.getModule(TD);
//# sourceMappingURL=td.js.map