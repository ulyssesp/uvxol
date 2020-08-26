<template>
  <v-card>
    <v-list-item three-line>
      <v-list-item-content class="align-self-start">
        <v-list-item-title class="title" v-text="action.name"></v-list-item-title>
        <v-chip-group multiple>
          <v-chip>{{ action.type }}</v-chip>
          <v-chip>{{ action.location }}</v-chip>
        </v-chip-group>
        <v-list-item-subtitle>
          <div class="text-center" v-if="action.type == 'vote'">
            <v-subheader>votes</v-subheader>
            <v-btn
              class="ma-2"
              v-for="(voteOption, i) in action.voteOptions"
              :key="i"
              @click="chooseOption(voteOption.id, action.id)"
            >{{ voteOption.name }}</v-btn>
          </div>
          <div else>{{ action.filePath }}</div>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
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
