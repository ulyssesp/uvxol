<template>
    <v-container fluid grid-list-lg>
        <v-row>
            <h4> Error {{ err }} </h4>
        </v-row>
        <v-data-table
            :headers="headers"
            :items="flatVoteOptions()"
            :items-per-page="10"
            class="elevation-1"
        >
            <template v-slot:item.action="{ item }">
                <v-icon small @click="deleteVoteOption(item.id)">delete</v-icon>
            </template>
            
        </v-data-table>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { VoteOption, VoteOptionId } from '../types'
import { array, option } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { Option } from 'fp-ts/lib/Option';
import voteOptionStore from '@/store/modules/voteoptions';

@Component
export default class VoteOptionsList extends Vue {
    @Prop({required:true}) voteOptions!: VoteOption[];
    @Prop({}) err!: string;
    flatVoteOptions = () =>
        array.map((vo: VoteOption) => 
        ({...vo, 
            preventions: array.filterMap(pid => 
                pipe(
                    this.voteOptions,
                    array.findFirst((vop: VoteOption) => pid === vop.id),
                    option.map(vo => vo.name)
                ))(vo.preventions).join(),
            dependencies: array.filterMap(pid => 
                pipe(
                    this.voteOptions,
                    array.findFirst((vop: VoteOption) => pid === vop.id),
                    option.map(vo => vo.name)
                ))(vo.dependencies).join(),
        }))(this.voteOptions)
    headers = [
        { text: "name", value: "name" }, 
        { text: "text", value: "text" }, 
        { text: "dependencies", value: "dependencies" }, 
        { text: "preventions", value: "preventions" }, 
        { text: "edit", value: "action" }, 
    ]
    deleteVoteOption(id: number) {
        voteOptionStore.deleteVoteOption(id)
            .then(() => this.$emit('data-change'))
            .catch((err: any) => this.err = err);
    }
}
</script>
