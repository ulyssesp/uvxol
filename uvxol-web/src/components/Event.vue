<template>
  <v-card v-bind:disabled="event.state !== 'active'">
    <v-list-item three-line>
      <v-list-item-content class="align-self-start">
        <v-list-item-title class="headline mb-2">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on">{{ event.name }}</span>
            </template>
            <span>{{ event.name }}</span>
          </v-tooltip>
        </v-list-item-title>
        Triggered by: {{ triggerName }}
        <v-list-item-subtitle>
          State: {{ event.state }}, Start:
          <TimeView :time="event.start" />, End:
          <TimeView :time="event.end" />
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ActionEvent, EventRenderData } from "../types";
import runStore from "@/store/modules/run";
import TimeView from "./Time.vue";

@Component({
  components: { TimeView },
})
export default class Event extends Vue {
  @Prop({ required: true }) event!: EventRenderData;
  async chooseOption(id: number, actionId: number) {
    runStore.chooseVote(["control", id, actionId]);
  }
  get triggerName() {
    return this.event.triggerId === undefined ? "undefined" 
      : this.event.triggerId === -1 ? "start" 
      : runStore.eventsById[this.event.triggerId] === undefined ? "unfound"
      : runStore.eventsById[this.event.triggerId].name;
  }
}
</script>
