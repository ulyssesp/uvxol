<template>
  <v-container fluid grid-list-lg>
    <v-card-title>
      <v-container>
        <v-row>
          <v-col class="d-flex align-center">
            <h2>Actions</h2>
            <a
              href="https://www.notion.so/fpnewtion/Program-Logic-d5d9da560317453a8ba519cf2b4bd5d6#d2d53abf8aa9469eb9ff72c2322d3c65"
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
                  {{ currentActions.length }} items?</v-card-text
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
          <v-col class="flex-grow-0 flex-shrink-1" cols="1">
            <v-dialog v-model="dialog" @click:outside="closeDialog">
              <template v-slot:activator="{ on }">
                <v-btn small color="primary" dark class="mb-2" v-on="on"
                  >New</v-btn
                >
              </template>
              <CreateAction
                :actions="actions"
                :voteOptions="voteOptions"
                :updateAction="editingAction"
                :updateId="editingId"
                v-on:done="closeDialog"
                v-on:data-change="refresh"
              ></CreateAction>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="flatactions"
      :items-per-page="100"
      class="elevation-1"
      :search="search"
      v-on:current-items="changeCurrentActions"
    >
      <template v-slot:item.action="{ item }">
        <v-icon small @click="editAction(item.id)">mdi-pencil</v-icon>
        <v-icon small @click="duplicateAction(item.id)"
          >mdi-content-copy</v-icon
        >
        <v-icon small @click="deleteAction(item.id)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  Action,
  VoteOption,
  ActionType,
  isVoteAction,
  EditableAction,
  isFunMeterAction,
  isFileAction,
  actionVoteOptions,
} from "../types";
import { array } from "fp-ts";
import actionStore from "../store/modules/actions";
import CreateAction from "./CreateAction.vue";

const defaultAction: EditableAction<"video"> = {
  name: "",
  zone: "FILM",
  location: "CONTENT",
  type: "video",
  filePath: "",
  voteOptions: [],
};

const mapAction = (val: Action<ActionType> | undefined) =>
  val
    ? Object.assign({}, val, {
        voteOptions: actionVoteOptions(val),
      })
    : defaultAction;

@Component({
  components: { CreateAction },
})
export default class ActionsList extends Vue {
  @Prop({ required: true }) readonly actions!: Action<ActionType>[];
  @Prop({ required: true }) readonly voteOptions!: VoteOption[];
  @Prop({}) err!: string;
  dialog = false;
  deleteDialog = false;
  editingId: number | undefined = undefined;
  editingAction: EditableAction<ActionType> = defaultAction;
  currentActions: Action<ActionType>[] = [];
  // Used above for filtering the list
  // TODO: also filter items
  search = "";
  get flatactions() {
    return array.map((a: Action<ActionType>) => ({
      ...a,
      voteOptions: array
        .map((vo: VoteOption) => vo.name)(actionVoteOptions(a))
        .join(),
    }))(this.actions);
  }
  headers = [
    { text: "name", value: "name" },
    { text: "type", value: "type" },
    { text: "zone", value: "zone" },
    { text: "location", value: "location" },
    { text: "file", value: "filePath" },
    { text: "voteOptions", value: "voteOptions" },
    { text: "edit", value: "action" },
  ];
  // Delete and emit data-change
  deleteAction(id: number) {
    actionStore
      .deleteAction(id)
      .then(() => this.$emit("data-change"))
      .catch((err) => (this.err = err));
  }
  // Edit and open dialog
  editAction(id: number) {
    this.editingId = id;
    this.editingAction = mapAction(actionStore.actionsDict[id]);
    this.dialog = true;
  }
  // Remember to Reset the dialog!
  closeDialog() {
    this.dialog = false;
    this.editingAction = defaultAction;
    this.editingId = undefined;
  }
  refresh() {
    this.$emit("data-change");
  }
  changeCurrentActions(v: any[]) {
    this.currentActions = v;
  }
  deleteVisibleDialog() {
    this.deleteDialog = true;
  }
  closeDeleteDialog() {
    this.deleteDialog = false;
  }
  deleteConfirmed() {
    Promise.all(
      this.currentActions.map((action) => actionStore.deleteAction(action.id))
    )
      .then(() => this.$emit("data-change"))
      .then(() => this.closeDeleteDialog())
      .catch((err) => (this.err = err));
  }
  duplicateAction(id: number) {
    actionStore
      .createOrUpdateAction(
        Object.assign({}, actionStore.actionsDict[id], { id: undefined })
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
}
</script>
