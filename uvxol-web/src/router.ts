import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {path: '/actions', component: () => import(/* webpackChunkName: "actions" */ '@/views/Actions.vue')},
    {path: '/events', component: () => import(/* webpackChunkName: "events" */ '@/views/Events.vue')},
    {path: '/voteOptions', component: () => import(/* webpackChunkName: "voteOptions" */ '@/views/VoteOptions.vue')},
    {path: '/runner', component: () => import(/* webpackChunkName: "runner" */ '@/views/Runner.vue')},
    {path: '/*', redirect: '/actions'},
    {path: '', redirect: '/actions'},
  ],
});
