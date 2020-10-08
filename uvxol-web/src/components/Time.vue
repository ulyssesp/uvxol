<template>
  <span>
    {{ Math.floor(time / 60000) }}:{{
      ((time / 1000) % 60).toString().padStart(2, "0")
    }}
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TimeView extends Vue {
  @Prop({ required: true }) time: number = 0;
}
</script>