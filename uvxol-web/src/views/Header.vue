<template>
  <v-app-bar app>
    <v-toolbar-title class="headline text-uppercase">
      <span>UVXOL Management</span>
    </v-toolbar-title>
    <v-toolbar-items>
      <router-link to="/actions"><v-btn text>Actions</v-btn></router-link>
      <router-link to="/events"><v-btn text>Events</v-btn></router-link>
      <router-link to="/voteoptions"><v-btn text>Vote Options</v-btn></router-link>
      <router-link to="/runner"><v-btn text>Runner</v-btn></router-link>
    </v-toolbar-items>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Header extends Vue {};
</script>
