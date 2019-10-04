<template>
  <v-app-bar app>
    <v-toolbar-title class="headline text-uppercase">
      <span>UVXOL Management</span>
    </v-toolbar-title>
    <template v-slot:extension>
    <v-toolbar-items>
      <v-tabs align-with-title background-color="transparent">
        <v-tab to="/actions">Actions</v-tab>
        <v-tab to="/events">Events</v-tab>
        <v-tab to="/voteoptions">Vote Options</v-tab>
        <v-tab to="/runner">Runner</v-tab>
      </v-tabs>
    </v-toolbar-items>
    </template>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Header extends Vue {};
</script>
