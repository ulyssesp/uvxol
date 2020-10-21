<template>
  <v-card :loading="loading" v-on:keyup.enter="submit">
    <v-card-title>
      Create Event
      <v-subtitle>
        <div :v-bind:err="err">{{ err }}</div>
      </v-subtitle>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="4">
            <v-text-field
              v-model="editedEvent.name"
              label="Name"
              placeholder="To find it on this site"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="editedEvent.duration"
              label="Duration"
              placeholder="Of all actions"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="editedEvent.delay"
              label="Delay"
              placeholder="Before firing actions"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-autocomplete
              :items="events"
              item-text="name"
              v-model="editedEvent.triggers"
              label="Can trigger"
              placeholder="Events fired after this one"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="triggersInput"
              @change="triggersInput = ''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedEvent.triggers.splice(data.index, 1)"
                >
                  <span>{{ data.item.name }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete
              :items="actions"
              item-text="name"
              label="Actions"
              placeholder="Played after Delay"
              v-model="editedEvent.actions"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="actionsInput"
              @change="actionsInput = ''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedEvent.actions.splice(data.index, 1)"
                >
                  <span>{{ data.item.name }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-autocomplete
              :items="voteOptions"
              item-text="name"
              label="Depends on"
              placeholder="These vote options to fire"
              v-model="editedEvent.dependencies"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="dependsInput"
              @change="dependsInput = ''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedEvent.dependencies.splice(data.index, 1)"
                >
                  <span>{{ data.item.name }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete
              :items="voteOptions"
              item-text="name"
              label="Prevented by"
              placeholder="these vote options - won't fire"
              v-model="editedEvent.preventions"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="preventsInput"
              @change="preventsInput = ''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedEvent.preventions.splice(data.index, 1)"
                >
                  <span>{{ data.item.name }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-btn color="success" text v-on:click="submit">save</v-btn>
      <v-btn color="success" text v-on:click="close">cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  ActionEvent,
  Action,
  VoteOption,
  ActionType,
  EditableEvent,
} from "../types";
import { array } from "fp-ts";
import Events from "../store/modules/events";
import { getModule } from "vuex-module-decorators";
import eventStore from "../store/modules/events";

@Component({
  components: {},
})
export default class CreateEvent extends Vue {
  @Prop({ required: true }) readonly actions!: Action<ActionType>[];
  @Prop({ required: true }) readonly events!: ActionEvent[];
  @Prop({ required: true }) readonly voteOptions!: VoteOption[];
  @Prop() readonly updateId!: any | undefined;
  @Prop() readonly updateEvent!: EditableEvent;
  triggersInput = "";
  actionsInput = "";
  dependsInput = "";
  preventsInput = "";
  err = "";
  loading = false;
  editedEvent = this.updateEvent;
  editedId = this.updateId;
  @Watch("updateEvent")
  onEditEvent(val: EditableEvent) {
    this.editedEvent = val;
  }
  @Watch("updateId")
  onEditId(val: number) {
    this.editedId = val;
  }
  submit() {
    this.loading = true;
    eventStore
      .createOrUpdateEvent(
        Object.assign({ id: this.updateId }, this.editedEvent)
      )
      .then(() => (this.err = "success"))
      .then(() => (this.loading = false))
      .then(() => this.$emit("data-change"))
      .then(() => this.close())
      .catch((err: any) => {
        try {
          this.err = err.error.err.originalError.info.message;
        } catch {
          this.err = err;
        }
      });
  }
  close() {
    this.$emit("done");
  }
}
</script>
