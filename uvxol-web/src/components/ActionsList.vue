<template>
    <v-container fluid grid-list-lg>
        <v-row>
            <h4> Error {{ err }} </h4>
        </v-row>
        <v-data-table
            :headers="headers"
            :items="flatactions()"
            :items-per-page="10"
            class="elevation-1"
        >
            <template v-slot:item.action="{ item }">
                <v-icon small @click="deleteAction(item.id)">delete</v-icon>
            </template>
            
        </v-data-table>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Action, VoteOption } from '../types'
import { array } from 'fp-ts';
import actionStore from '../store/modules/actions';

@Component
export default class ActionsList extends Vue {
    @Prop({required:true}) actions!: Action[];
    @Prop({}) err!: string;
    flatactions = () => 
        array.map((a: Action) => ({
          ...a, 
          voteOptions: array.map((vo: VoteOption) => vo.name)(a.voteOptions || []).join() 
        }))(this.actions)
    headers = [
        { text: "name", value: "name" }, 
        { text: "file", value: "file" }, 
        { text: "location", value: "location" }, 
        { text: "type", value: "type" }, 
        { text: "voteOptions", value: "voteOptions" }, 
        { text: "edit", value: "action" }, 
    ]
    deleteAction(id: number) {
        actionStore.deleteAction(id)
            .then(() => this.$emit('data-change'))
            .catch(err => this.err = err);
    }
}
</script>
