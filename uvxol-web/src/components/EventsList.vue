<template>
    <v-container fluid grid-list-lg>
        <v-row>
            <h4> Status: {{ err }} </h4>
        </v-row>
        <v-data-table
            :headers="headers"
            :items="flatevents"
            :items-per-page="10"
            class="elevation-1"
        >
            <template v-slot:item.action="{ item }">
                <v-icon small @click="deleteEvent(item.id)">
                    delete
                </v-icon>
            </template>
            
        </v-data-table>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ActionEvent, Action, VoteOption } from '../types'
import { array, option } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import Events from '../store/modules/events'
import { getModule } from 'vuex-module-decorators';
import eventStore from '../store/modules/events';


@Component
export default class EventsList extends Vue {
    @Prop({required:true}) events!: ActionEvent[];
    @Prop({required:true}) actions!: Action[];
    private err = "";
    get flatevents() {
      return array.map((e: ActionEvent) => ({
          ...e, 
          actions: array.map((a: Action) => a.name)(e.actions || []).join(),
          dependencies: array.map<VoteOption, string>(vo => vo.name)(e.dependencies || []).join(),
          preventions: array.map<VoteOption, string>(vo => vo.name)(e.preventions || []).join(),
          triggers: array.filterMap(pid => 
              pipe(
                  this.events,
                  array.findFirst<ActionEvent>(vot => pid === vot.id),
                  option.map<ActionEvent, string>(e => e.name)
              ))(e.triggers || []).join(),
      }))(this.events);
    }
    headers = [
        { text: "name", value: "name" }, 
        { text: "duration", value: "duration" }, 
        { text: "delay", value: "delay" }, 
        { text: "actions", value: "actions" }, 
        { text: "triggers", value: "triggers" }, 
        { text: "edit", value: "action" }, 
    ]
    deleteEvent(id: number) {
        eventStore.deleteEvent(id)
            .then(() => this.$emit('data-change'))
            .catch(err => this.err = err);
    }
}
</script>
