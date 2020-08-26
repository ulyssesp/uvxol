<template>
  <v-container fluid grid-list-lg>
    <v-row>
      <h4>Status: {{ err }}</h4>
    </v-row>
    <v-card-title>
      <v-container>
        <v-row>
          <v-col cols="2">Events</v-col>
          <v-col class="flex-shrink-1"></v-col>
          <v-col class="flex-grow-1">
            <v-text-field
              v-model="search"
              label="Search"
              append-icon="search"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
          <v-col class="flex-grow-0">
            <v-dialog v-model="dialog">
              <template v-slot:activator="{ on }">
                <v-btn color="primary" dark class="mb-2" v-on="on">New Item</v-btn>
              </template>
              <CreateEvent
                :actions="actions"
                :events="events"
                :voteOptions="voteOptions"
                :updateEvent="editingEvent"
                :updateId="editingId"
                v-on:data-change="refresh"
                v-on:done="closeDialog"
              ></CreateEvent>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="flatevents"
      :items-per-page="10"
      class="elevation-1"
      :search="search"
    >
      <template v-slot:item.action="{ item }">
        <v-icon small @click="editEvent(item.id)">edit</v-icon>
        <v-icon small @click="deleteEvent(item.id)">delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ActionEvent, Action, VoteOption } from "../types";
import { array, option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import Events from "../store/modules/events";
import { getModule } from "vuex-module-decorators";
import eventStore from "../store/modules/events";
import CreateEvent from "./CreateEvent.vue";

@Component({
  components: { CreateEvent },
})
export default class EventsList extends Vue {
  @Prop({ required: true }) readonly events!: ActionEvent[];
  @Prop({ required: true }) readonly actions!: Action[];
  @Prop({ required: true }) readonly voteOptions!: VoteOption[];
  private err = "";
  dialog = false;
  search = "";
  editingId: number | undefined = undefined;
  editingEvent: ActionEvent | undefined = undefined;
  get flatevents() {
    return array.map((e: ActionEvent) => ({
      ...e,
      actions: array
        .map((a: Action) => a.name)(e.actions || [])
        .join(),
      dependencies: array
        .map<VoteOption, string>((vo) => vo.name)(e.dependencies || [])
        .join(),
      preventions: array
        .map<VoteOption, string>((vo) => vo.name)(e.preventions || [])
        .join(),
      triggers: array
        .filterMap((pid) =>
          pipe(
            this.events,
            array.findFirst<ActionEvent>((vot) => pid === vot.id),
            option.map<ActionEvent, string>((e) => e.name)
          )
        )(e.triggers || [])
        .join(),
    }))(this.events);
  }
  headers = [
    { text: "name", value: "name" },
    { text: "duration", value: "duration" },
    { text: "delay", value: "delay" },
    { text: "actions", value: "actions" },
    { text: "triggers", value: "triggers" },
    { text: "edit", value: "action" },
  ];
  closeDialog() {
    this.dialog = false;
    this.editingId = undefined;
    this.editingEvent = undefined;
  }
  deleteEvent(id: number) {
    eventStore
      .deleteEvent(id)
      .then(() => this.$emit("data-change"))
      .catch((err) => (this.err = err));
  }
  editEvent(id: number) {
    this.editingId = id;
    this.editingEvent = eventStore.events[id];
    this.dialog = true;
  }
}
</script>
