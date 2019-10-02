<template>
  <v-card>
    <v-list-item three-line>
      <v-list-item-content class="align-self-start">
        <v-list-item-title v-text="event.name" class="headline mb-2"></v-list-item-title>
        <v-list-item-subtitle>Delay: {{ event.delay }}, Duration: {{ event.duration }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ActionEvent } from '../types';
import runStore from '@/store/modules/run';

@Component
export default class Event extends Vue {
  @Prop({required:true}) event!: ActionEvent;
  async chooseOption(id: number, actionId: number) {
    runStore.chooseVote([id, actionId]);
  }
}

</script>
