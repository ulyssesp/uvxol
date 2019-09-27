<template>
    <v-container fluid grid-list-lg>
      <v-row>
        <h4> Status: {{ err }} </h4>
      </v-row>
      <v-row justify="space-around"
        v-for="(actionEvent, i) in events"
          :key="i">
        <v-col >
          <Event v-bind:event="actionEvent"></Event>
        </v-col>
      </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ActionEvent, Action, VoteOption } from '../types'
import { array, option } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import eventStore from '../store/modules/events';
import Event from '../components/Event.vue';

@Component({
  components: { Event }
})
export default class EventsList extends Vue {
  private events: ActionEvent[] = eventStore.events;
  private err = '';
  get eventList() {
    return eventStore.events;
  }
  @Watch('eventList')
  public updateEvents(e: ActionEvent[]) {
    this.events = e;
  }
  private refresh() {
    this.err = 'loading';
    Promise.all([
        eventStore.getEvents(),
      ]).catch((e: any) => this.err = e)
        .then(() => this.err = 'loaded');
  }
  protected mounted() {
    this.refresh();
  }
}
</script>
