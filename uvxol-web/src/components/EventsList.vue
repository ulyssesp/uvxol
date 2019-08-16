<template>
    <v-container fluid grid-list-lg>
        <v-data-table
            :headers="headers"
            :items="flatevents()"
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
import { ActionEvent, Action } from '../types'
import { deleteEvent } from '../services/EventsService';
import { array } from 'fp-ts';

@Component
export default class EventsList extends Vue {
    @Prop({required:true}) events!: ActionEvent[];
    @Prop({required:true}) actions!: Action[];
    flatevents = () => array.map((e: ActionEvent) => ({...e, actions: array.map((a: Action) => a.name)(e.actions).join()}))(this.events);
    err!: string;
    headers = [
        { text: "name", value: "name" }, 
        { text: "duration", value: "duration" }, 
        { text: "delay", value: "delay" }, 
        { text: "actions", value: "actions" }, 
        { text: "edit", value: "action" }, 
    ]
    deleteEvent(id: number) {
        deleteEvent(id)
            .then(() => this.$emit('data-change'))
            .catch(err => this.err = err);
    }
}
</script>