<template>
    <v-container>
        <v-row>
            <div :v-bind:err="err"> {{ err }} </div>
        </v-row>
        <v-row>
            <v-text-field v-model="name" label="Name"></v-text-field>
            <v-text-field v-model="file" label="File"></v-text-field>
            <v-text-field v-model="location" label="Location"></v-text-field>
            <v-select
                :items="items"
                v-model="type"
                label="type"
                segmented overflow editable
                target="#target"
            ></v-select>
            <v-btn color="success" v-on:click="submit">add</v-btn>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, ActionTypesMap } from '../types';
import { postAction } from '../services/ActionsService';
import { lookup } from 'dns';

@Component({
    components: {}
})


export default class CreateAction extends Vue {
    items = ['audio', 'video', 'vote'];
    err = "success";
    name = "";
    file = "";
    location = "";
    type = "";
    submit() {
        postAction(this.name, this.file, ActionTypesMap[this.type], this.location)
            .then(() => this.err = "success")
            .then(() => this.$emit('data-change'))
            .catch(err => this.err = err)
    }
}
</script>