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
            <v-text-field v-model="editedEvent.name" label="Name"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="editedEvent.duration" label="Duration"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="editedEvent.delay" label="Delay"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-select
                :items="events"
                item-text="name"
                v-model="editedEvent.triggers"
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
                v-model="editedEvent.actions"
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
                v-model="editedEvent.dependencies"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
          </v-col>
          <v-col>
            <v-select
                :items="voteOptions"
                item-text="name"
                label="Prevented by"
                v-model="editedEvent.preventions"
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
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { ActionEvent, Action, VoteOption } from '../types';
import { lookup } from 'dns';
import { array } from 'fp-ts';
import Events from '../store/modules/events'
import { getModule } from 'vuex-module-decorators';
import eventStore from '../store/modules/events';

const defaultEvent = { 
    name: '', 
    duration: 4000, 
    delay: 0, 
    actions: [] as number[],
    triggers: [] as number[],
    dependencies: [] as number[],
    preventions: [] as number[]
  };

const mapEvent = (val: ActionEvent | undefined) => val ? { 
      name: val.name,
      duration: val.duration,
      delay: val.delay || 0,
      triggers: val.triggers,
      actions: val.actions.map(d => d.id),  
      dependencies: val.dependencies.map(d => d.id),  
      preventions: val.preventions.map(p => p.id)
    } : defaultEvent

@Component({
    components: {}
})
export default class CreateAction extends Vue {
  @Prop({ required: true }) readonly actions!: Action[];
  @Prop({ required: true }) readonly events!: ActionEvent[];
  @Prop({ required: true }) readonly voteOptions!: VoteOption[];
  @Prop() readonly updateId!: any | undefined;
  @Prop() readonly updateEvent!: any | undefined;
  err = "";
  loading = false;
  editedEvent = mapEvent(this.updateEvent);
  editedId = this.updateId;
  @Watch('updateEvent')
  onEditEvent(val: ActionEvent) {
    this.editedEvent = mapEvent(val);
  }
  submit() {
    this.loading = true;
    eventStore.createOrUpdateEvent(
      Object.assign({ id: this.updateId }, this.editedEvent))
      .then(() => this.err = "success")
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
    this.editedId = undefined;
    this.editedEvent = defaultEvent;
    this.$emit('done')
  }
}
</script>
