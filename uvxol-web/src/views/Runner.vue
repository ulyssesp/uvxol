<template>
  <v-container fluid grid-list-lg class>
    <v-row>
      <h4>Status: {{ err }}</h4>
    </v-row>
    <v-row>
      <v-btn @click="start()">Start</v-btn>
    </v-row>
    <v-row>{{ chosenVoteOptions }}</v-row>
    <v-row class="flex-nowrap">
      <v-col cols="2" class="flex-grow-1">
        <v-row>
          <v-subheader>Events</v-subheader>
        </v-row>
        <v-row v-for="(event, i) in events" :key="i" class="mb-3" cols="2">
          <Event v-bind:event="event" class="pa-1 flex-grow-1"></Event>
        </v-row>
      </v-col>
      <v-col v-for="(zone, i) in actionLogByZone" :key="i" cols="2">
        <v-row>
          <v-subheader>{{ zone[0] }}</v-subheader>
        </v-row>
        <v-row v-for="(action, i) in zone[1]" :key="i" class="mb-3">
          <ActionC v-bind:action="action" class="ms-2 pa-1 flex-grow-1"></ActionC>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  ActionEvent,
  Action,
  VoteOption,
  ActionType,
  ViewAction,
  ViewEvent,
} from "../types";
import { array, option, show } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { constant } from "fp-ts/lib/function";
import runStore from "../store/modules/run";
import voteOptionStore from "../store/modules/voteoptions";
import Event from "../components/Event.vue";
import ActionC from "../components/Action.vue";
import * as sg from "fp-ts/lib/Semigroup";
import * as fold from "fp-ts/lib/Foldable";
import * as m from "fp-ts/lib/Monoid";
import * as na from "fp-ts/lib/NonEmptyArray";
import * as r from "fp-ts/lib/Record";

import { logid, logval } from "../utils/fp-utils";

@Component({
  components: { ActionC, Event },
})
export default class EventsList extends Vue {
  private err = "";
  get actionLogByZone() {
    return pipe(
      this.events,
      array.chain((e: ViewEvent) => e.actions),
      na.fromArray,
      option.map(
        na.groupBy((a: ViewAction<ActionType>) => a.zone.toLowerCase())
      ),
      option.map(r.toArray),
      option.map(array.reverse),
      option.getOrElse(
        constant([] as [string, Array<ViewAction<ActionType>>][])
      )
    );
  }
  get log() {
    return runStore.log;
  }
  get events() {
    return array.reverse(this.log);
  }
  get chosenVoteOptions() {
    return pipe(
      runStore.chosenVoteOptions,
      Object.values,
      array.map((k) => voteOptionStore.voteOptions[k].name),
      (vos) => fold.intercalate(m.monoidString, array.array)(", ", vos),
      (s) => "ChosenVoteOptions: " + s
    );
  }
  private refresh() {
    this.err = "loading";
    Promise.all([runStore.start()])
      .catch((e: any) => (this.err = e))
      .then(() => (this.err = "loaded"));
  }
  protected mounted() {
    this.refresh();
  }
  async start() {
    runStore.start();
  }
}
</script>
