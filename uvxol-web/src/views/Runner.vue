<template>
  <v-container fluid grid-list-lg class>
    <v-row>
      <h4>Status: {{ err }}</h4>
    </v-row>
    <v-row>
      <v-btn @click="start()">Start</v-btn>
    </v-row>
    <v-row>
      <v-col>
        <v-autocomplete
          :items="voteOptions"
          label="Chosen vote options"
          placeholder="These vote options have been chosen by the audience"
          v-model="chosenVoteOptions"
          item-value="id"
          item-text="name"
          multiple
          dense
          flat
          chips
          deletable-chips
          :search-input.sync="chooseVoteOption"
        >
          <template v-slot:selection="data">
            <v-chip close @click:close="chosenVoteOptions.splice(index, 1)">
              <span>{{ data.item.name }}</span>
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
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
import * as set from "fp-ts/lib/Set";

import { logid, logval } from "../utils/fp-utils";
import { VoteOptionId } from "../../../UVXOL-AzureFunction/Shared/types";
import { eqNumber } from "fp-ts/lib/Eq";

@Component({
  components: { ActionC, Event },
})
export default class Runner extends Vue {
  chooseVoteOption = "";
  chosenVoteOptions: VoteOptionId[] = [];
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
  get chosenVoteOptionsList(): VoteOptionId[] {
    return runStore.chosenVoteOptions;
  }
  @Watch("chosenVoteOptionsList")
  updateVoteOptionsList(vos: VoteOptionId[]) {
    this.chosenVoteOptions = vos;
  }
  @Watch("chosenVoteOptions")
  updateVoteOptions(vos: VoteOptionId[]) {
    // If the ids are different, update the runStore and clear the text entry
    if (
      !pipe(vos, set.fromArray(eqNumber), (s) =>
        set
          .getEq(eqNumber)
          .equals(set.fromArray(eqNumber)(runStore.chosenVoteOptions), s)
      )
    ) {
      this.chooseVoteOption = "";
      runStore.overrideVoteOptions(vos);
    }
  }
  get voteOptions() {
    return voteOptionStore.voteOptionsList;
  }
  private refresh() {
    this.err = "loading";
    const startId =
      !this.$route.params.id || this.$route.params.id === ""
        ? undefined
        : parseInt(this.$route.params.id as string);
    Promise.all([voteOptionStore.getVoteOptions(), runStore.start(startId)])
      .catch((e: any) => (this.err = e))
      .then(() => (this.err = "loaded"));
  }
  protected mounted() {
    this.refresh();
  }
  async start() {
    this.refresh();
  }
}
</script>
