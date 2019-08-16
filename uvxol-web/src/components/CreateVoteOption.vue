<template>
    <v-container>
        <v-row>
            <div :v-bind:err="err"> {{ err }} </div>
        </v-row>
        <v-row>
            <v-text-field v-model="name" label="Name"></v-text-field>
            <v-text-field v-model="text" label="Text"></v-text-field>
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
            <v-btn color="success" v-on:click="submit">add</v-btn>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { VoteOption } from '../types';
import { postVoteOption } from '../services/VoteOptionsService';
import { lookup } from 'dns';

@Component({
    components: {}
})

export default class CreateVoteOption extends Vue {
    @Prop() voteOptions!: VoteOption[];
    name = "";
    text = "";
    preventions = [];
    dependencies = [];
    err = "";
    submit() {
        postVoteOption(this.name, this.text, this.dependencies, this.preventions)
            .then(() => this.err = "success")
            .then(() => this.$emit('data-change'))
            .catch(err => this.err = err)
    }
}
</script>