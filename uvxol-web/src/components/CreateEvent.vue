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
                :items="voteOptions"
                item-text="name"
                label="Depends on"
                v-model="dependencies"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
            <v-select
                :items="voteOptions"
                item-text="name"
                label="Prevented by"
                v-model="preventions"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
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
import { ActionEvent, Action, VoteOption } from '../types';
import { lookup } from 'dns';
import { array } from 'fp-ts';
import Events from '../store/modules/events'
import { getModule } from 'vuex-module-decorators';

const eventStore = getModule(Events)

@Component({
    components: {}
})
export default class CreateAction extends Vue {
    @Prop() actions!: Action[];
    @Prop() events!: ActionEvent[];
    @Prop() voteOptions!: VoteOption[];
    err = "success";
    name = "";
    duration = "4000";
    delay = "0";
    actionChoices = []
    triggers = []
    dependencies = []
    preventions = []
    submit() {
        eventStore.createEvent(this.name, this.triggers, parseInt(this.duration), parseInt(this.delay), this.actionChoices)
            .then(() => this.err = "success")
            .then(() => this.$emit('data-change'))
            .catch(err => this.err = err)
    }
}
</script>
