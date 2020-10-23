<template>
  <v-container fluid grid-list-lg class>
    <v-row>
      <h4>Status: {{ err }}</h4>
    </v-row>
    <v-row>
      <v-btn @click="start()">Start</v-btn>
      <v-btn @click="setSpeed(1)">Play</v-btn>
      <v-btn @click="setSpeed(0)">Pause</v-btn>
      <v-btn @click="doubleSpeed()">Speed up</v-btn>
      <v-btn @click="halfSpeed()">Speed down</v-btn>
      <v-btn @click="setSpeed(-1)">Reverse</v-btn>
      <TimeView v-bind:time="viewTime" />
      <span class="text-h6">Speed: x{{ speed }}</span>
    </v-row>
    <v-row>
      <span class="text-h6">Fun meter: {{ funMeter }}</span>
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
          <ActionC
            v-bind:action="action"
            class="ms-2 pa-1 flex-grow-1"
          ></ActionC>
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
  EventRenderData,
  ActionRenderData,
} from "../types";
import { array, nonEmptyArray, option, show } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { constant, flow } from "fp-ts/lib/function";
import runStore from "../store/modules/run";
import voteOptionStore from "../store/modules/voteoptions";
import eventStore from "../store/modules/events";
import actionStore from "../store/modules/actions";
import Event from "../components/Event.vue";
import ActionC from "../components/Action.vue";
import TimeView from "../components/Time.vue";
import * as sg from "fp-ts/lib/Semigroup";
import * as fold from "fp-ts/lib/Foldable";
import * as m from "fp-ts/lib/Monoid";
import * as na from "fp-ts/lib/NonEmptyArray";
import * as r from "fp-ts/lib/Record";
import * as set from "fp-ts/lib/Set";
import * as ord from "fp-ts/lib/Ord";
import * as eq from "fp-ts/lib/Eq";

import { logid, logval } from "../utils/fp-utils";
import { VoteOptionId } from "../../../UVXOL-AzureFunction/Shared/types";
import { eqNumber } from "fp-ts/lib/Eq";
import { none } from "fp-ts/lib/Option";

const stateOrdMap = {
  active: -1,
  pending: 0,
  finished: 1,
};

@Component({
  components: { ActionC, Event, TimeView },
})
export default class Runner extends Vue {
  chooseVoteOption = "";
  chosenVoteOptions: VoteOptionId[] = [];
  viewTime = 0;
  private err = "";
  get actionLogByZone() {
    return pipe(
      runStore.actionList,
      na.fromArray,
      option.map(
        flow(
          na.groupBy((a: Omit<ActionRenderData<ActionType>, "type">) =>
            a.zone.toLowerCase()
          ),
          r.toArray,
          array.sort(
            ord.fromCompare<
              [string, Omit<ActionRenderData<ActionType>, "type">[]]
            >((a, b) => ord.ordString.compare(a[1][0].zone, b[1][0].zone))
          )
        )
      ),
      option.getOrElse(
        constant(
          [] as [string, Array<Omit<ActionRenderData<ActionType>, "type">>][]
        )
      )
    );
  }
  get log() {
    return runStore.events;
  }
  get events() {
    return pipe(
      runStore.events,
      array.reverse,
      na.fromArray,
      option.chain(
        flow(
          na.sort<EventRenderData>(
            ord.fromCompare((a, b) =>
              stateOrdMap[a.state] < stateOrdMap[b.state]
                ? -1
                : stateOrdMap[a.state] > stateOrdMap[b.state]
                ? 1
                : 0
            )
          ),
          na.group<EventRenderData>(
            eq.fromEquals((a, b) => a.state === a.state)
          ),
          na.fromArray
        )
      ),
      option.map(na.flatten),
      option.fold(
        () => [] as EventRenderData[],
        (a) => a
      )
    );
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
    Promise.all([
      voteOptionStore.getVoteOptions(),
      eventStore.getEvents(),
      actionStore.getActions(),
    ])
      .catch((e: any) => (this.err = e))
      .then(() => (this.err = "loaded"))
      .then(() => runStore.restart(startId));
  }
  protected mounted() {
    this.refresh();

    const setTime = () => {
      this.viewTime = Math.floor(runStore.time / 1000) * 1000;
    };

    // Hacky way to throttle updating the time view
    setInterval(setTime, 1000);
  }
  async start() {
    this.refresh();
  }

  async doubleSpeed() {
    runStore.doubleSpeed();
  }
  async halfSpeed() {
    runStore.halfSpeed();
  }
  async setSpeed(speed: number) {
    runStore.setTimeScale(speed);
  }

  get speed() {
    return runStore.speed;
  }

  get funMeter() {
    return runStore.funMeter;
  }
}
</script>
