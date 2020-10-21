<template>
  <v-card :loading="loading" v-on:keyup.enter="submit">
    <v-card-title>
      Create Vote Option
      <v-subtitle>
        <div :v-bind:err="err">{{ err }}</div>
      </v-subtitle>
    </v-card-title>

    <v-card-text>
      <v-container>
        <v-row>
          <v-text-field
            v-model="editedVoteOption.name"
            label="Name"
          ></v-text-field>
          <v-text-field
            v-model="editedVoteOption.shortname"
            label="Short Name"
          ></v-text-field>
          <v-text-field
            v-model="editedVoteOption.text"
            label="Text"
          ></v-text-field>
          <v-col>
            <v-autocomplete
              :items="voteOptions"
              item-text="name"
              label="Depends on"
              placeholder="These vote options to fire"
              v-model="editedVoteOption.dependencies"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="dependsInput"
              @change="dependsInput = ''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedVoteOption.dependencies.splice(data.index, 1)"
                >
                  <span>{{ data.item.name }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete
              :items="voteOptions"
              item-text="name"
              label="Prevented by"
              placeholder="these vote options - won't fire"
              v-model="editedVoteOption.preventions"
              item-value="id"
              multiple
              dense
              flat
              chips
              deletable-chips
              :search-input.sync="preventsInput"
              @change="preventsInput = ''"
            >
              <template v-slot:selection="data">
                <v-chip
                  close
                  @click:close="data.splice(index, 1)"
                  @click="editedVoteOption.preventions.splice(data.index, 1)"
                >
                  <span>{{ data.item.name }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-btn color="success" v-on:click="submit">add</v-btn>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { EditableVoteOption, VoteOption } from "../types";
import voteOptionStore from "../store/modules/voteoptions";

@Component({
  components: {},
})
export default class CreateVoteOption extends Vue {
  @Prop() voteOptions!: VoteOption[];
  @Prop() readonly updateId!: number | undefined;
  @Prop() readonly updateVoteOption!: EditableVoteOption;
  name = "";
  text = "";
  preventions = [];
  dependencies = [];
  err = "";
  loading = false;
  editedVoteOption = this.updateVoteOption;
  editedId = this.updateId;
  @Watch("updateVoteOption")
  onEditVoteOption(val: EditableVoteOption) {
    this.editedVoteOption = val;
  }
  @Watch("updateId")
  onEditId(val: number) {
    this.editedId = val;
  }
  submit() {
    this.loading = true;
    voteOptionStore
      .createOrUpdateVoteOption({
        id: this.updateId,
        name: this.editedVoteOption.name,
        shortname: this.editedVoteOption.shortname,
        text: this.editedVoteOption.text,
        dependencies: this.editedVoteOption.dependencies,
        preventions: this.editedVoteOption.preventions,
      })
      .then(() => (this.err = "loaded"))
      .then(() => (this.loading = false))
      .then(() => this.$emit("data-change"))
      .then(() => this.close())
      .catch((err: any) => {
        try {
          this.err = err.error.err.originalError.info.message;
        } catch {
          this.err = err;
        }
      });
  }
  close() {
    this.$emit("done");
  }
}
</script>
