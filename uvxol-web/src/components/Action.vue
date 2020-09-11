<template>
  <v-card v-bind:disabled="!action.active">
    <v-card-title class="title text-no-wrap">
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <span v-bind="attrs" v-on="on">{{ action.name }}</span>
        </template>
        <span>{{ action.name }}</span>
      </v-tooltip>
    </v-card-title>
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
import { Action, ActionType, ViewAction } from "../types";
import runStore from "@/store/modules/run";

@Component
export default class ActionView extends Vue {
  @Prop({ required: true }) action!: ViewAction<ActionType>;
  async chooseOption(id: number) {
    runStore.chooseVote([id, this.action.id]);
  }
}
</script>
