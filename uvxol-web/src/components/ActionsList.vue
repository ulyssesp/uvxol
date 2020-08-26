<template>
  <v-container fluid grid-list-lg>
    <v-row>
      <h4>Status: {{ err }}</h4>
    </v-row>
    <v-card-title>
      <v-container>
        <v-row>
          <v-col cols="2">Actions</v-col>
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
              <CreateAction
                :actions="actions"
                :voteOptions="voteOptions"
                :updateAction="editingAction"
                :updateId="editingId"
                v-on:data-change="refresh"
                v-on:done="closeDialog"
              ></CreateAction>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="flatactions"
      :items-per-page="10"
      class="elevation-1"
      :search="search"
    >
      <template v-slot:item.action="{ item }">
        <v-icon small @click="editAction(item.id)">edit</v-icon>
        <v-icon small @click="deleteAction(item.id)">delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Action, VoteOption } from "../types";
import { array } from "fp-ts";
import actionStore from "../store/modules/actions";
import CreateAction from "./CreateAction.vue";

@Component({
  components: { CreateAction },
})
export default class ActionsList extends Vue {
  @Prop({ required: true }) readonly actions!: Action[];
  @Prop({ required: true }) readonly voteOptions!: VoteOption[];
  @Prop({}) err!: string;
  dialog = false;
  editingId: number | undefined = undefined;
  editingAction: Action | undefined = undefined;
  search = "";
  get flatactions() {
    return array.map((a: Action) => ({
      ...a,
      voteOptions: array
        .map((vo: VoteOption) => vo.name)(a.voteOptions || [])
        .join(),
    }))(this.actions);
  }
  headers = [
    { text: "name", value: "name" },
    { text: "file", value: "filePath" },
    { text: "location", value: "location" },
    { text: "type", value: "type" },
    { text: "voteOptions", value: "voteOptions" },
    { text: "edit", value: "action" },
  ];
  deleteAction(id: number) {
    actionStore
      .deleteAction(id)
      .then(() => this.$emit("data-change"))
      .catch((err) => (this.err = err));
  }
  editAction(id: number) {
    this.editingId = id;
    this.editingAction = actionStore.actionsList[id];
    this.dialog = true;
  }
  closeDialog() {
    this.dialog = false;
    this.editingAction = undefined;
    this.editingId = undefined;
  }
}
</script>
