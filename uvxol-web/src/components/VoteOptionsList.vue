<template>
  <v-container fluid grid-list-lg>
    <v-card-title>
      <v-container>
        <v-row class="d-flex align-center">
          <h2>Vote Options (Choices, Votes)</h2>
          <v-col>
            <a
              href="https://www.notion.so/fpnewtion/Program-Logic-d5d9da560317453a8ba519cf2b4bd5d6#3a1493865afa4aa8a9070ff27c04f6f5"
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
              <CreateVoteOption
                :voteOptions="voteOptions"
                :updateVoteOption="editingVoteOption"
                :updateId="editingId"
                v-on:data-change="refresh"
                v-on:done="closeDialog"
              ></CreateVoteOption>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="flatVoteOptions"
      :items-per-page="100"
      :search="search"
      @current-items="changeCurrentItems"
      class="elevation-1"
    >
      <template v-slot:item.action="{ item }">
        <v-icon small @click="editVoteOption(item.id)">mdi-pencil</v-icon>
        <v-icon small @click="duplicateVoteOption(item.id)"
          >mdi-content-copy</v-icon
        >
        <v-icon small @click="deleteVoteOption(item.id)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { EditableVoteOption, VoteOption, VoteOptionId } from "../types";
import { array, option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { Option } from "fp-ts/lib/Option";
import voteOptionStore from "@/store/modules/voteoptions";
import CreateVoteOption from "./CreateVoteOption.vue";
import voteoptions from "../store/modules/voteoptions";

const mapVoteOption = (val: VoteOption): EditableVoteOption => ({
  name: val.name,
  text: val.text,
  preventions: val.preventions,
  dependencies: val.dependencies,
  shortname: val.shortname,
  funRequirement: val.funRequirement,
  budgetRequirement: val.budgetRequirement,
});

const defaultVoteOption: EditableVoteOption = {
  name: "",
  text: "",
  preventions: [] as number[],
  dependencies: [] as number[],
  shortname: "",
  funRequirement: undefined,
  budgetRequirement: undefined,
};

@Component({
  components: { CreateVoteOption },
})
export default class VoteOptionsList extends Vue {
  @Prop({ required: true }) voteOptions!: VoteOption[];
  @Prop({}) err!: string;
  dialog = false;
  deleteDialog = false;
  search = "";
  editingId: number | undefined = undefined;
  editingVoteOption: EditableVoteOption = defaultVoteOption;
  currentItems: VoteOption[] = [];

  get flatVoteOptions() {
    return array.map((vo: VoteOption) => ({
      ...vo,
      preventions: array
        .filterMap((pid) =>
          pipe(
            this.voteOptions,
            array.findFirst((vop: VoteOption) => pid === vop.id),
            option.map((vo) => vo.name)
          )
        )(vo.preventions || [])
        .join(),
      dependencies: array
        .filterMap((pid) =>
          pipe(
            this.voteOptions,
            array.findFirst((vop: VoteOption) => pid === vop.id),
            option.map((vo) => vo.name)
          )
        )(vo.dependencies || [])
        .join(),
    }))(this.voteOptions);
  }
  headers = [
    { text: "name", value: "name" },
    { text: "text", value: "text" },
    { text: "shortname", value: "shortname" },
    { text: "dependencies", value: "dependencies" },
    { text: "preventions", value: "preventions" },
    { text: "edit", value: "action" },
  ];
  closeDialog() {
    this.dialog = false;
    this.editingId = undefined;
    this.editingVoteOption = defaultVoteOption;
  }
  editVoteOption(id: number) {
    this.editingId = id;
    this.editingVoteOption = mapVoteOption(voteOptionStore.voteOptions[id]);
    this.dialog = true;
  }
  deleteVisibleDialog() {
    this.deleteDialog = true;
  }
  closeDeleteDialog() {
    this.deleteDialog = false;
  }
  deleteVoteOption(id: number) {
    voteOptionStore
      .deleteVoteOption(id)
      .then(() => this.$emit("data-change"))
      .catch((err: any) => (this.err = err));
  }
  changeCurrentItems(v: any[]) {
    this.currentItems = v;
  }
  deleteConfirmed() {
    Promise.all(
      this.currentItems.map((e) => voteOptionStore.deleteVoteOption(e.id))
    )
      .then(() => this.$emit("data-change"))
      .then(() => this.closeDeleteDialog())
      .catch((err) => (this.err = err));
  }
  refresh() {
    this.$emit("data-change");
  }
  duplicateVoteOption(id: number) {
    voteOptionStore
      .createOrUpdateVoteOption(
        Object.assign({}, voteOptionStore.voteOptions[id], { id: undefined })
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
