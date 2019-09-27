<template>
    <v-container>
        <v-row>
            <div :v-bind:err="err"> {{ err }} </div>
        </v-row>
        <v-row>
            <v-text-field v-model="name" label="Name"></v-text-field>
            <v-text-field v-model="location" label="Location"></v-text-field>
            <v-select
                :items="items"
                v-model="type"
                label="type"
                segmented overflow editable
                target="#target"
            ></v-select>
            <v-text-field v-model="file" label="File"></v-text-field>
            <v-text-field v-model="text" label="Vote Text"></v-text-field>
            <v-select
                :items="voteOptions"
                item-text="name"
                label="Vote options"
                v-model="voteOptionChoices"
                item-value="id"
                segmented overflow editable multiple
            ></v-select>
            <v-btn color="success" v-on:click="submit">add</v-btn>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Action, ActionTypesMap, VoteOption } from '../types';
import { lookup } from 'dns';
import actionStore from '../store/modules/actions';

@Component({
    components: {}
})
export default class CreateAction extends Vue {
    @Prop() voteOptions!: VoteOption[];
    items = ['audio', 'video', 'vote'];
    err = "success";
    name = "";
    file = "";
    location = "";
    type = "video";
    text = "";
    voteOptionChoices=[];
    submit() {
      actionStore.createAction({
        name: this.name, 
        filePath: this.file, 
        type: ActionTypesMap[this.type], 
        location: this.location, 
        voteOptions: this.voteOptionChoices, 
        text: this.text
      })
        .then(() => this.err = "success")
        .then(() => this.$emit('data-change'))
        .catch((err: any) => 
          {
            try {
              this.err = err.error.err.originalError.info.message
            } catch {
              this.err = err
            }
          })
    }
}
</script>
