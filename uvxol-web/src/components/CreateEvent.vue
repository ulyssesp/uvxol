<template>
  <v-card :loading="loading">
    <v-card-title>
      Create Event
      <v-subtitle><div :v-bind:err="err"> {{ err }} </div></v-subtitle>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="4">
            <v-text-field v-model="name" label="Name"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="duration" label="Duration"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="delay" label="Delay"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-select
                :items="events"
                item-text="name"
                v-model="triggers"
                label="Triggers"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
          </v-col>
          <v-col>
            <v-select
                :items="actions"
                item-text="name"
                label="Actions"
                v-model="actionChoices"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-select
                :items="voteOptions"
                item-text="name"
                label="Depends on"
                v-model="dependencies"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
          </v-col>
          <v-col>
            <v-select
                :items="voteOptions"
                item-text="name"
                label="Prevented by"
                v-model="preventions"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-btn color="success" text v-on:click="submit">save</v-btn>
      <v-btn color="success" text v-on:click="close">cancel</v-btn>
    </v-card-actions>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ActionEvent, Action, VoteOption } from '../types';
import { lookup } from 'dns';
import { array } from 'fp-ts';
import Events from '../store/modules/events'
import { getModule } from 'vuex-module-decorators';
import eventStore from '../store/modules/events';

@Component({
    components: {}
})
export default class CreateAction extends Vue {
  @Prop({ required: true }) readonly actions!: Action[];
  @Prop({ required: true }) readonly events!: ActionEvent[];
  @Prop({ required: true }) readonly voteOptions!: VoteOption[];
  @Prop({ default: '' }) readonly updateName!: string;
  @Prop({ default: '4000' }) readonly updateDuration!: string;
  @Prop({ default: '0' }) readonly updateDelay!: string;
  //@Prop({ default: [] }) readonly updateActionChoices: number[];
  //@Prop({ default: [] }) readonly updateTriggers: number[];
  //@Prop({ default: [] }) readonly updateDependencies: number[];
  //@Prop({ default: [] }) readonly updatePreventions: number[];
  err = "";
  loading = false;
  name = this.updateName;
  duration = this.updateDelay;
  delay = "0";
  actionChoices = []
  triggers: number[] = []
  dependencies: number[] = []
  preventions: number[] = []
  submit() {
    this.loading = true;
    eventStore.createEvent({ 
      name: this.name, 
      triggers: this.triggers, 
      duration: parseInt(this.duration), 
      delay: parseInt(this.delay), 
      actions: this.actionChoices,
      preventions: this.preventions,
      dependencies: this.dependencies
    }).then(() => this.err = "success")
      .then(() => this.loading = false)
      .then(() => this.$emit('data-change'))
      .then(() => this.close())
      .catch((err: any) => 
        {
          try {
            this.err = err.error.err.originalError.info.message
          } catch {
            this.err = err
          }
        })
  }
  close() {
    this.name = "";
    this.duration = "4000";
    this.delay = "0";
    this.actionChoices = [];
    this.triggers = [];
    this.dependencies = [];
    this.preventions = [];
    this.$emit('done')
  }
}
</script>
