<template>
  <v-app>
    <Header></Header>
    <v-content>
      <div id="app">
        <router-view></router-view>
      </div>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Header from '@/views/Header.vue';


@Component({
  components: { Header }
})
export default class App extends Vue {};
</script>
