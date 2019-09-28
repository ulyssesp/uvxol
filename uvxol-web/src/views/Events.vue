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
import actionStore from '../store/modules/actions';
import eventStore from '../store/modules/events';
import voteOptionStore from '../store/modules/voteoptions';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: { CreateEvent, EventsList },
})
export default class EventsView extends Vue {
  private err = 'loading';
  get actions() {
    return actionStore.actionsList;
  }
  get events() {
    return eventStore.eventsList;
  }
  get voteOptions() {
    return voteOptionStore.voteOptionsList;
  }
  private refresh() {
    this.err = 'loading';
    Promise.all([
        actionStore.getActions(),
        eventStore.getEvents(),
        voteOptionStore.getVoteOptions()
      ]).catch((e: any) => this.err = e)
        .then(() => this.err = 'loaded');
  }
  protected mounted() {
    this.refresh();
  }
}
</script>
