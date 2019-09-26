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
import { store, eventStore } from '../store';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: { CreateEvent, EventsList },
})
export default class EventsView extends Vue {
  private actions: Action[] = [];
  private events: ActionEvent[] = eventStore.events;
  private voteOptions: VoteOption[] = [];
  private err = 'success';
  get eventList() {
    return eventStore.events;
  }
  @Watch('eventList')
  public updateEvents(e: ActionEvent[]) {
    this.events = e;
  }
  private refresh() {
    this.err = 'loading';
    eventStore.getEvents()
      .catch((e: any) => this.err = e)
      .then(() => this.err = 'success');
  }
  protected mounted() {
    this.refresh();
  }
}
</script>
