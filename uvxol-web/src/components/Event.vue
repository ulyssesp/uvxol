<template>
  <v-card>
    <v-subheader v-text="event.name"></v-subheader>
    <v-list three-line>
      <v-list-item-group>
        <v-list-item
          v-for="(action, i) in event.actions"
          :key="i"
          >
          <v-list-item-content>
            <v-list-item-title>
              {{ action.name }}
              <v-chip-group multiple>
                <v-chip> {{ action.type }}</v-chip>
                <v-chip> {{ action.location }}</v-chip>
              </v-chip-group>
            </v-list-item-title>
            <v-list-item-subtitle>
              <div class="text-center" v-if="action.type == 'vote'">
                <v-subheader> votes </v-subheader>
                <v-btn 
                  class="ma-2"
                  v-for="(voteOption, i) in action.voteOptions"
                  :key="i"
                  @click="chooseOption(voteOption.id, action.id)">
                  {{ voteOption.name }}
                </v-btn>
              </div>
              <div else>
                {{ action.filePath }}
              </div>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ActionEvent } from '../types';
import runStore from '@/store/modules/run.ts';

@Component
export default class Event extends Vue {
  @Prop({required:true}) event!: ActionEvent;
  async chooseOption(id: number, actionId: number) {
    runStore.chooseVote([id, actionId]);
  }
}

</script>
