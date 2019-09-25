<!-- <template> -->
<!--     <v-container> -->
<!--         <v-row> -->
<!--             <v-col> -->
<!--                 <CreateVoteOption :voteOptions="voteOptions" v-on:data-change="refresh"></CreateVoteOption> -->
<!--             </v-col> -->
<!--         </v-row> -->
<!--         <v-row> -->
<!--             <v-col> -->
<!--                 <VoteOptionsList v-bind:voteOptions="voteOptions" v-bind:err="err" v-on:data-change="refresh"></VoteOptionsList> -->
<!--             </v-col> -->
<!--         </v-row> -->
<!--     </v-container> -->
<!-- </template> -->

<!-- <script lang="ts"> -->
<!-- import { Vue, Component } from 'vue-property-decorator'; -->
<!-- import CreateVoteOption from '../components/CreateVoteOption.vue'; -->
<!-- import VoteOptionsList from '../components/VoteOptionsList.vue'; -->
<!-- import { VoteOption } from '../types'; -->
<!-- import { getVoteOptions } from '../services/VoteOptionsService'; -->


<!-- @Component({ -->
<!--     components: { CreateVoteOption, VoteOptionsList } -->
<!-- }) -->
<!-- export default class VoteOptions extends Vue { -->
<!--     voteOptions: VoteOption[] = []; -->
<!--     err = "success"; -->
<!--     refresh(){ -->
<!--         getVoteOptions() -->
<!--             .then((voteOptions) => this.voteOptions = voteOptions) -->
<!--             .then(() => this.err = "success") -->
<!--             .catch(err => this.err = err); -->
<!--     } -->
<!--     protected mounted() { -->
<!--         this.refresh(); -->
<!--     } -->
<!-- }; -->
<!-- </script> -->
