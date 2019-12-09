import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import store from './store';
import VueSocketIO from 'vue-socket.io';
Vue.config.productionTip = false;
Vue.config.silent = true;
Vue.use(new VueSocketIO({
    debug: true,
    connection: "ws://localhost:8080",
    vuex: {
        store,
        actionPrefix: "SOCKET_",
        mutationPrefix: "SOCKET_"
    },
}));
new Vue({
    vuetify,
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
//# sourceMappingURL=main.js.map