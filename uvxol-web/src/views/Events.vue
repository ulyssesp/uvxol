
<template>
    <v-container>
        <v-row>
            <v-col>
                <CreateEvent :actions="actions" :events="events" :voteOptions="voteOptions" v-on:data-change="refresh"></CreateEvent>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <EventsList v-bind:actions="actions" v-bind:events="events" :voteOptions="voteOptions" v-bind:err="err" v-on:data-change="refresh"></EventsList>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CreateEvent from '../components/CreateEvent.vue';
import EventsList from '../components/EventsList.vue';
import { Action, ActionEvent, VoteOption } from '../types';
import { getActions } from '../services/ActionsService';
import { getEvents } from '../services/EventsService';
import { getVoteOptions } from '../services/VoteOptionsService';


@Component({
    components: { CreateEvent, EventsList }
})
export default class Actions extends Vue {
    actions: Action[] = [];
    events: ActionEvent[] = [];
    voteOptions: VoteOption[] = [];
    err = "success";
    refresh(){
        Promise.all([
            getEvents().then((events) => this.events = events),
            getActions().then((actions) => this.actions = actions),
            getVoteOptions().then((voteOptions) => this.voteOptions = voteOptions)
        ])
        .then(() => this.err = "success")
        .catch(err => this.err = err)
    }
    protected mounted() {
        this.refresh();
    }
};
</script>
