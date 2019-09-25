<template>
    <v-container>
        <v-row>
            <v-col>
                <CreateEvent :actions="actions" :events="events" :voteOptions="voteOptions" v-on:data-change="refresh"></CreateEvent>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <EventsList v-bind:actions="actions" v-bind:events="events" :voteOptions="voteOptions" v-bind:err="err" v-on:data-change="refresh"></EventsList>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">

import CreateEvent from '../components/CreateEvent.vue';
import EventsList from '../components/EventsList.vue';
import { Action, ActionEvent, VoteOption } from '../types';
import Events from '../store/modules/events';
import { getModule } from 'vuex-module-decorators';
// import { eventStore } from '../store/utils/store-accessor';
import store from '../store'
import { Component, Vue, Watch } from 'vue-property-decorator';

const eventStore = getModule(Events)

@Component({
  components: { CreateEvent, EventsList }
})
export default class EventsView extends Vue {
  actions: Action[] = [];
  events: ActionEvent[] = eventStore.events;
  voteOptions: VoteOption[] = [];
  err = "success";
  get eventList() {
    return eventStore.events;
  }
  @Watch('eventList')
  updateEvents(e: ActionEvent[]) {
    this.events = e;
  }
  refresh() {
    eventStore.getEvents();
  }
  mounted() {
    this.refresh();
  }
};
</script>
