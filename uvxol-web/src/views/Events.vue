
<template>
    <v-container>
        <v-row>
            <v-col>
                <CreateEvent :actions="actions" :events="events" v-on:data-change="refresh"></CreateEvent>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <EventsList v-bind:actions="actions" v-bind:events="events" v-bind:err="err" v-on:data-change="refresh"></EventsList>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CreateEvent from '../components/CreateEvent.vue';
import EventsList from '../components/EventsList.vue';
import { Action, ActionEvent } from '../types';
import { getActions } from '../services/ActionsService';
import { getEvents } from '../services/EventsService';


@Component({
    components: { CreateEvent, EventsList }
})
export default class Actions extends Vue {
    actions: Action[] = [];
    events: ActionEvent[] = [];
    err = "success";
    refresh(){
        console.log("refresh")
        Promise.all([
            getEvents().then((events) => this.events = events),
            getActions().then((actions) => this.actions = actions)
        ])
        .then(() => this.err = "success")
        .catch(err => this.err = err)
    }
    protected mounted() {
        this.refresh();
    }
};
</script>
