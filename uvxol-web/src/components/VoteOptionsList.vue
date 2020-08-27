<template>
  <v-container fluid grid-list-lg>
    <v-card-title>
      <v-container>
        <v-row>
          <v-col class="d-flex align-center">
            <h2>Vote Options (Choices, Votes)</h2>
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
        <v-row>
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
        </v-row>
        <v-row>
          <v-col>
            <CreateVoteOption :voteOptions="voteOptions" v-on:data-change="refresh"></CreateVoteOption>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="flatVoteOptions"
      :items-per-page="10"
      :search="search"
      class="elevation-1"
    >
      <template v-slot:item.action="{ item }">
        <v-icon small @click="deleteVoteOption(item.id)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { VoteOption, VoteOptionId } from "../types";
import { array, option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { Option } from "fp-ts/lib/Option";
import voteOptionStore from "@/store/modules/voteoptions";
import CreateVoteOption from "./CreateVoteOption.vue";

@Component({
  components: { CreateVoteOption },
})
export default class VoteOptionsList extends Vue {
  @Prop({ required: true }) voteOptions!: VoteOption[];
  @Prop({}) err!: string;
  search = "";
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
    { text: "dependencies", value: "dependencies" },
    { text: "preventions", value: "preventions" },
    { text: "edit", value: "action" },
  ];
  deleteVoteOption(id: number) {
    voteOptionStore
      .deleteVoteOption(id)
      .then(() => this.$emit("data-change"))
      .catch((err: any) => (this.err = err));
  }
}
</script>
