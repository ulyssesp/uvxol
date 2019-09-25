<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>UVXOL Management</span>
      </v-toolbar-title>
      <router-link to="/actions">Actions</router-link>
      <router-link to="/events">Events</router-link>
      <router-link to="/voteoptions">Vote Options</router-link>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
//import Actions from './views/Actions.vue';
import Events from './views/Events.vue';
//import VoteOptions from './views/VoteOptions.vue';
import VueRouter from 'vue-router';

export default Vue.extend({
  router: new VueRouter({
    routes: [
      //{path: "/actions", component: Actions},
      {path: "/events", component: Events},
      //{path: "/voteoptions", component: VoteOptions},
      //  {path: '', name: 'actions', component: Actions},
      //  {path: '/*', name: 'actions', component: Actions}
    ]
  }),
  name: 'App',
  components: {
    Events,
  },
  data: () => ({
    //
  }),
});
</script>
