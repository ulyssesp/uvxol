<template>
  <v-container fluid grid-list-lg>
    <v-card-title>
      <v-container>
        <v-row class="d-flex align-center">
          <h2>Events</h2>
          <v-col>
            <a
              href="https://www.notion.so/fpnewtion/Program-Logic-d5d9da560317453a8ba519cf2b4bd5d6#c220173228a342198036ca4d95a5119e"
              target="_new"
            >
              <v-btn text small>
                <v-icon small>mdi-information-outline</v-icon>
              </v-btn>
            </a>
          </v-col>
        </v-row>
        <v-row class="d-flex align-baseline">
          <v-col>
            <sub>Status: {{ err }}</sub>
          </v-col>
          <v-col class="flex-grow-1">
            <v-text-field
              v-model="search"
              label="Search"
              append-icon="mdi-table-search"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
          <v-col class="flex-grow-0 flex-shrink-1" cols="2">
            <v-dialog v-model="deleteDialog">
              <template v-slot:activator="{ on }">
                <v-btn small color="error" dark class="mb-2" v-on="on"
                  >Delete visible</v-btn
                >
              </template>
              <v-card>
                <v-card-title>Confirm deletion</v-card-title>
                <v-card-text
                  >Are you sure you want to delete
                  {{ currentItems.length }} items?</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="closeDeleteDialog"
                    >Uhh nvm</v-btn
                  >
                  <v-btn color="primary" @click="deleteConfirmed"
                    >Get rid of that shite</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
          <v-col class="flex-grow-0" cols="1">
            <v-dialog v-model="dialog" @click:outside="closeDialog">
              <template v-slot:activator="{ on }">
                <v-btn small color="primary" dark v-on="on">New Item</v-btn>
              </template>
              <CreateEvent
                :actions="actions"
                :events="events"
                :voteOptions="voteOptions"
                :updateEvent="editingEvent"
                :updateId="editingId"
                v-on:done="closeDialog"
                v-on:data-change="refresh"
              ></CreateEvent>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="flatevents"
      :items-per-page="-1"
      class="elevation-1"
      :search="search"
      @current-items="changeCurrentItems"
    >
      <template v-slot:item.action="{ item }">
        <v-icon small class="mr-2" @click="editEvent(item.id)"
          >mdi-pencil</v-icon
        >
        <v-icon small class="mr-2" @click="duplicateEvent(item.id)"
          >mdi-content-copy</v-icon
        >
        <v-icon small class="mr-2" @click="deleteEvent(item.id)"
          >mdi-delete</v-icon
        >
        <v-icon small class="mr-2" @click="runEvent(item.id)">mdi-play</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  ActionEvent,
  Action,
  VoteOption,
  ActionType,
  EditableEvent,
} from "../types";
import { array, option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import Events from "../store/modules/events";
import { getModule } from "vuex-module-decorators";
import eventStore from "../store/modules/events";
import CreateEvent from "./CreateEvent.vue";
import router from "../router";
import * as nonEmptyArray from "fp-ts/lib/NonEmptyArray";
import * as set from "fp-ts/lib/Set";
import { eqNumber } from "fp-ts/lib/Eq";

const defaultEvent: EditableEvent = {
  name: "",
  duration: 4000,
  delay: 0,
  actions: [] as number[],
  triggers: [] as number[],
  dependencies: [] as number[],
  preventions: [] as number[],
};

const mapEvent = (val: ActionEvent): EditableEvent => ({
  name: val.name,
  duration: val.duration,
  delay: val.delay || 0,
  triggers: val.triggers,
  actions: val.actions.map((d) => d.id),
  dependencies: val.dependencies.map((d) => d.id),
  preventions: val.preventions.map((p) => p.id),
});

@Component({
  components: { CreateEvent },
})
export default class EventsList extends Vue {
  @Prop({ required: true }) readonly events!: ActionEvent[];
  @Prop({ required: true }) readonly actions!: Action<ActionType>[];
  @Prop({ required: true }) readonly voteOptions!: VoteOption[];
  @Prop({}) err!: string;
  dialog = false;
  search = "";
  editingId: number | undefined = undefined;
  editingEvent: EditableEvent = defaultEvent;
  currentItems: ActionEvent[] = [];
  deleteDialog = false;
  get flatevents() {
    return pipe(
      this.events,
      (eventsOrig) => {
        const events = [...eventsOrig];

        // events by id
        const eventmap: Record<number, ActionEvent> = {};

        // keep track of the starting events (events which have nothing that triggers them)
        const startEvents = set.fromArray<number>(eqNumber)(
          events.map((e) => e.id)
        );

        events.forEach((e) => {
          eventmap[e.id] = e;
          e.triggers.forEach((t) => startEvents.delete(t));
        });

        const bfs: number[] = [];
        const queue: number[] = [...startEvents.values()];
        const previousEvents: Set<number> = new Set();
        while (queue.length != 0) {
          const id: number = queue.shift()!;
          if (!previousEvents.has(id)) {
            bfs.push(id);
            eventmap[id].triggers.forEach((t: number) => queue.push(t));
            previousEvents.add(id);
          }
        }

        return bfs.map((eid) => eventmap[eid]);
      },
      array.map((e: ActionEvent) => ({
        ...e,
        actions: array
          .map((a: Action<ActionType>) => a.name)(e.actions || [])
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
      }))
    );
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
    this.editingEvent = defaultEvent;
  }
  deleteEvent(id: number) {
    eventStore
      .deleteEvent(id)
      .then(() => this.$emit("data-change"))
      .catch((err) => (this.err = err));
  }
  editEvent(id: number) {
    this.editingId = id;
    this.editingEvent = mapEvent(eventStore.events[id]);
    this.dialog = true;
  }
  duplicateEvent(id: number) {
    eventStore
      .createOrUpdateEvent(
        Object.assign({}, eventStore.events[id], { id: undefined })
      )
      .then(() => (this.err = "success"))
      .then(() => this.$emit("data-change"))
      .catch((err: any) => {
        try {
          this.err = err.error.err.originalError.info.message;
        } catch {
          this.err = err;
        }
      });
  }
  refresh() {
    this.$emit("data-change");
  }
  changeCurrentItems(v: any[]) {
    this.currentItems = v;
  }
  deleteVisibleDialog() {
    this.deleteDialog = true;
  }
  closeDeleteDialog() {
    this.deleteDialog = false;
  }
  deleteConfirmed() {
    Promise.all(this.currentItems.map((e) => eventStore.deleteEvent(e.id)))
      .then(() => this.$emit("data-change"))
      .then(() => this.closeDeleteDialog())
      .catch((err) => (this.err = err));
  }
  runEvent(id: number) {
    this.$router.push({ name: "runner", params: { id: id.toString() } });
  }
}
</script>
