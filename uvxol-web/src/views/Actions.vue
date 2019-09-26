
<template>
    <v-container>
        <v-row>
            <v-col>
                <CreateAction :voteOptions="voteOptions" v-on:data-change="refresh"></CreateAction>
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
import { Vue, Component, Watch } from 'vue-property-decorator';
import CreateAction from '../components/CreateAction.vue';
import ActionsList from '../components/ActionsList.vue';
import { Action, VoteOption } from '../types';
import { actionStore, voteOptionStore } from '../store';


@Component({
    components: { CreateAction, ActionsList }
})
export default class Actions extends Vue {
  private voteOptions: VoteOption[] = [];
  private actions: Action[] = [];
  private err = 'success';
  get actionList() {
    return actionStore.actionList;
  }
  get voteOptionList() {
    return voteOptionStore.voteOptions;
  }
  @Watch('actionList')
  public updateActions(a: Action[]) {
    this.actions = a;
  }
  @Watch('voteOptionList')
  public updateVoteOptions(v: VoteOption[]) {
    this.voteOptions = v;
  }
  private refresh(){
    this.err = 'loading';
    Promise.all([
        actionStore.getActions()
        voteOptionStore.getVoteOptions()
      ])
      .then(() => this.err = "success")
      .catch((err: any) => this.err = err);
  }
  protected mounted() {
    this.refresh();
  }
};
</script>
