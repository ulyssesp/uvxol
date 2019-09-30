<template>
    <v-container fluid grid-list-lg>
      <v-row>
        <h4> Status: {{ err }} </h4>
      </v-row>
      <v-row>
        <v-btn @click="start()">Start</v-btn>
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
import runStore from '../store/modules/run';
import Event from '../components/Event.vue';

@Component({
  components: { Event }
})
export default class EventsList extends Vue {
  private err = '';
  get events() {
    return array.reverse(runStore.log);
  }
  private refresh() {
    this.err = 'loading';
    Promise.all([
        runStore.start(),
      ]).catch((e: any) => this.err = e)
        .then(() => this.err = 'loaded');
  }
  protected mounted() {
    this.refresh();
  }
  async start() {
    runStore.start()
  }
}
</script>
