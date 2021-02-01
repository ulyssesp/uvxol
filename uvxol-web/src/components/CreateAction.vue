<template>
  <v-card :loading="loading" v-on:keyup.enter="submit">
    <v-card-title>
      Create Action
      <v-subtitle>
        <div :v-bind:err="err">{{ err }}</div>
      </v-subtitle>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="4">
            <v-text-field
              v-model="editedAction.name"
              label="Name"
              placeholder="unique to this interface"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="editedAction.zone"
              label="Zone"
              placeholder="where this action will play"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="editedAction.location"
              label="Location"
              placeholder="the location this will play"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              :items="actionTypes"
              v-model="editedAction.type"
              label="type"
              segmented
              overflow
              editable
              target="#target"
            ></v-select>
          </v-col>
        </v-row>
        <v-row
          v-if="editedAction.type === 'video' || editedAction.type === 'audio'"
        >
          <v-col cols="6">
            <v-text-field
              v-model="editedAction.filePath"
              label="File"
              placeholder="filename of content"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              :items="voteOptions"
              item-text="name"
              label="Vote Options Tags"
              placeholder="chosen vote options appended to filepath"
              v-model="editedAction.voteOptions"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="voteOptionInput"
              @change="voteOptionInput = ''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedAction.voteOptions.splice(data.index, 1)"
                >
                  <span>{{ data.item.name }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row v-if="editedAction.type === 'vote'">
          <!-- <v-col cols="6">
            <v-text-field v-model="text" label="Vote Text"></v-text-field>
          </v-col>-->
          <v-col cols="6">
            <v-autocomplete
              :items="voteOptions"
              item-text="name"
              label="Vote options"
              placeholder="choices for this vote"
              v-model="editedAction.voteOptions"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="voteOptionInput"
              @change="voteOptionInput = ''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedAction.voteOptions.splice(data.index, 1)"
                >
                  <span>{{ data.item.name }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row v-if="editedAction.type === 'meter'">
          <v-col cols="6">
            <v-select
              :items="meterTypes"
              v-model="editedAction.meterType"
              label="meter type"
              segmented
              overflow
              editable
              target="#target"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="editedAction.value"
              label="Meter Value"
              placeholder="The meter value of this event"
            ></v-text-field>
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
  Action,
  ActionTypesMap,
  VoteOption,
  EditableAction,
  ActionType,
  isVoteAction,
} from "../types";
import actionStore from "../store/modules/actions";

@Component({
  components: {},
})
export default class CreateAction extends Vue {
  @Prop({ required: true }) voteOptions!: VoteOption[];
  @Prop() readonly updateId!: any;
  @Prop() readonly updateAction!: any;
  actionTypes = ["audio", "video", "vote", "meter"];
  meterTypes = ["fun", "budget"];
  err = "";
  type = "video";
  loading = false;
  editedAction = Object.assign({}, this.updateAction);
  editedId = this.updateId;
  voteOptionInput = "";
  @Watch("updateAction")
  onEditAction(val: Action<ActionType>) {
    this.editedAction = Object.assign({}, val);
  }
  @Watch("updateId")
  onEditId(val: number) {
    this.editedId = val;
  }
  submit() {
    actionStore
      .createOrUpdateAction(
        Object.assign({ id: this.updateId }, this.editedAction)
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
