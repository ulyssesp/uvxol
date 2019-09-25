
<!-- <template> -->
<!--     <v-container> -->
<!--         <v-row> -->
<!--             <v-col> -->
<!--                 <CreateAction :voteOptions="voteOptions" v-on:data-change="refresh"></CreateAction> -->
<!--             </v-col> -->
<!--         </v-row> -->
<!--         <v-row> -->
<!--             <v-col> -->
<!--                 <ActionsList v-bind:actions="actions" v-bind:err="err" v-on:data-change="refresh"></ActionsList> -->
<!--             </v-col> -->
<!--         </v-row> -->
<!--     </v-container> -->
<!-- </template> -->

<!-- <script lang="ts"> -->
<!-- import { Vue, Component } from 'vue-property-decorator'; -->
<!-- import CreateAction from '../components/CreateAction.vue'; -->
<!-- import ActionsList from '../components/ActionsList.vue'; -->
<!-- import { Action, VoteOption } from '../types'; -->
<!-- import { getActions } from '../services/ActionsService'; -->
<!-- import { getVoteOptions } from '../services/VoteOptionsService'; -->


<!-- @Component({ -->
<!--     components: { CreateAction, ActionsList } -->
<!-- }) -->
<!-- export default class Actions extends Vue { -->
<!--     voteOptions: VoteOption[] = []; -->
<!--     actions: Action[] = []; -->
<!--     err = "success"; -->
<!--     refresh(){ -->
<!--         Promise.all([ -->
<!--             getActions().then((actions) => this.actions = actions), -->
<!--             getVoteOptions().then((voteOptions) => this.voteOptions = voteOptions), -->
<!--         ]) -->
<!--         .then(() => this.err = "success") -->
<!--         .catch(err => this.err = err); -->
<!--     } -->
<!--     protected mounted() { -->
<!--         this.refresh(); -->
<!--     } -->
<!-- }; -->
<!-- </script> -->
