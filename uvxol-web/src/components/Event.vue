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
              <v-list v-if="action.type == 'vote'">
                <v-subheader> votes </v-subheader>
                <v-list-item v-for="(voteOption, i) in action.voteOptions"
                  :key="i">
                  <v-list-item-content>
                    <v-list-item-title> voteOption.name </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <div else>
                {{ action.file }}
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

@Component
export default class Event extends Vue {
  @Prop({required:true}) event!: ActionEvent;
}

</script>
