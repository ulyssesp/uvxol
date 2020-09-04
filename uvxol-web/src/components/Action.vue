<template>
  <v-card>
    <v-card-title class="title" v-text="action.name"></v-card-title>
    <v-card-text>
      <v-chip-group multiple>
        <v-chip small>{{ action.type }}</v-chip>
        <v-chip small>{{ action.location }}</v-chip>
      </v-chip-group>
      <v-list-item-subtitle v-if="action.type != 'vote'">{{ action.filePath }}</v-list-item-subtitle>
      <v-list dense v-if="action.type == 'vote'">
        <v-subheader>votes</v-subheader>
        <v-list-item v-for="(voteOption, i) in action.voteOptions" :key="i">
          <v-btn dense text @click="chooseOption(voteOption.id, action.id)">{{ voteOption.text }}</v-btn>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Action } from "../types";
import runStore from "@/store/modules/run";

@Component
export default class ActionView extends Vue {
  @Prop({ required: true }) action!: Action;
  async chooseOption(id: number) {
    runStore.chooseVote([id, this.action.id]);
  }
}
</script>
