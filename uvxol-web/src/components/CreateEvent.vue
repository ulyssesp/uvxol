<template>
    <v-container>
        <v-row>
            <div :v-bind:err="err"> {{ err }} </div>
        </v-row>
        <v-row>
            <v-select
                :items="events"
                item-text="name"
                v-model="triggers"
                label="Triggers"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
            <v-text-field v-model="name" label="Name"></v-text-field>
            <v-text-field v-model="duration" label="Duration"></v-text-field>
            <v-text-field v-model="delay" label="Delay"></v-text-field>
            <v-select
                :items="actions"
                item-text="name"
                label="Actions"
                v-model="actionChoices"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
            <v-btn color="success" v-on:click="submit">add</v-btn>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ActionEvent, Action } from '../types';
import { postAction } from '../services/ActionsService';
import { lookup } from 'dns';
import { postEvent } from '../services/EventsService';
import { array } from 'fp-ts';

@Component({
    components: {}
})
export default class CreateAction extends Vue {
    @Prop() actions!: Action[];
    @Prop() events!: ActionEvent[];
    err = "success";
    name = "";
    duration = "4000";
    delay = "0";
    actionChoices = []
    triggers = []
    submit() {
        postEvent(this.name, this.triggers, parseInt(this.duration), parseInt(this.delay), this.actionChoices)
            .then(() => this.err = "success")
            .then(() => this.$emit('data-change'))
            .catch(err => this.err = err)
    }
}
</script>