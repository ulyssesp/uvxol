
<template>
    <v-container>
        <v-row>
            <v-col>
                <CreateAction v-on:data-change="refresh"></CreateAction>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <ActionsList v-bind:actions="actions" v-bind:err="err" v-on:data-change="refresh"></ActionsList>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CreateAction from '../components/CreateAction.vue';
import ActionsList from '../components/ActionsList.vue';
import { Action } from '../types';
import { getActions } from '../services/ActionsService';


@Component({
    components: { CreateAction, ActionsList }
})
export default class Actions extends Vue {
    actions: Action[] = [];
    err = "success";
    refresh(){
        console.log("refresh")
        getActions().then((actions) => this.actions = actions)
            .then(() => this.err = "success")
            .catch(err => this.err = err);
    }
    protected mounted() {
        this.refresh();
    }
};
</script>
