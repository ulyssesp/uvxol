<template>
  <v-container v-on:keyup.enter="submit">
    <v-row>
      <div :v-bind:err="err">{{ err }}</div>
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
        segmented
        overflow
        editable
        multiple
      ></v-select>
      <v-select
        :items="voteOptions"
        item-text="name"
        label="Prevented by"
        v-model="preventions"
        item-value="id"
        segmented
        overflow
        editable
        multiple
      ></v-select>
      <v-btn color="success" v-on:click="submit">add</v-btn>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { VoteOption } from "../types";
import voteOptionStore from "../store/modules/voteoptions";

@Component({
  components: {},
})
export default class CreateVoteOption extends Vue {
  @Prop() voteOptions!: VoteOption[];
  name = "";
  text = "";
  preventions = [];
  dependencies = [];
  err = "";
  submit() {
    voteOptionStore
      .createVoteOption({
        name: this.name,
        text: this.text,
        dependencies: this.dependencies,
        preventions: this.preventions,
      })
      .then(() => (this.err = "loaded"))
      .then(() => this.$emit("data-change"))
      .catch((err: any) => {
        try {
          this.err = err.error.err.originalError.info.message;
        } catch {
          this.err = err;
        }
      });
  }
}
</script>
