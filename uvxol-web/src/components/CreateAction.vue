<template>
  <v-card :loading="loading">
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
            <v-text-field v-model="editedAction.name" label="Name"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="editedAction.location" label="Location"></v-text-field>
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
        <v-row v-if="editedAction.type === 'video' || editedAction.type === 'audio'">
          <v-col cols="12">
            <v-text-field v-model="file" label="File"></v-text-field>
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
              v-model="editedAction.voteOptions"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="dependsInput"
              @change="dependsInput=''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedAction.voteOptions.splice(data.index,1)"
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
import { Action, ActionTypesMap, VoteOption, EditableAction } from "../types";
import actionStore from "../store/modules/actions";

const defaultAction = {
  name: "",
  location: "FILM",
  type: "",
  filePath: undefined,
  voteOptions: undefined,
  text: undefined,
};

const mapAction: (
  val: Action | undefined
) => Omit<EditableAction, "voteOptions"> & {
  voteOptions: number[] | undefined;
} = (val) =>
  val
    ? {
        name: val.name,
        location: val.location,
        type: val.type,
        filePath: val.filePath,
        voteOptions: val.voteOptions
          ? val.voteOptions.map((vo) => vo.id)
          : undefined,
        text: val.text,
      }
    : defaultAction;

@Component({
  components: {},
})
export default class CreateAction extends Vue {
  @Prop({ required: true }) voteOptions!: VoteOption[];
  @Prop() readonly updateId!: any | undefined;
  @Prop() readonly updateAction!: any | undefined;
  actionTypes = ["audio", "video", "vote"];
  err = "";
  type = "video";
  loading = false;
  editedAction = mapAction(this.updateAction);
  editedId = this.updateId;
  @Watch("updateAction")
  onEditAction(val: Action) {
    this.editedAction = mapAction(val);
  }
  @Watch("updateId")
  onEditId(val: number) {
    this.editedId = val;
  }
  submit() {
    this.loading = true;
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
    this.editedId = undefined;
    this.editedAction = defaultAction;
    this.$emit("done");
  }
}
</script>
