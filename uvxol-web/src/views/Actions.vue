
<template>
  <v-container>
    <v-row>
      <v-col>
        <ActionsList
          v-bind:actions="actions"
          :voteOptions="voteOptions"
          v-bind:err="err"
          v-on:data-change="refresh"
        ></ActionsList>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import CreateAction from "../components/CreateAction.vue";
import ActionsList from "../components/ActionsList.vue";
import { Action, VoteOption } from "../types";
import actionStore from "../store/modules/actions";
import voteOptionStore from "../store/modules/voteoptions";

@Component({
  components: { CreateAction, ActionsList },
})
export default class Actions extends Vue {
  private err = "loading";
  get actions() {
    return actionStore.actionsList;
  }
  get voteOptions() {
    return voteOptionStore.voteOptionsList;
  }
  private refresh() {
    this.err = "loading";
    Promise.all([actionStore.getActions(), voteOptionStore.getVoteOptions()])
      .then(() => (this.err = "success"))
      .catch((err: any) => (this.err = err));
  }
  protected mounted() {
    this.refresh();
  }
}
</script>
