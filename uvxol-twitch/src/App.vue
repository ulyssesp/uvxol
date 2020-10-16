<template>
  <TwitchOverlay />
</template>

<script>
import TwitchOverlay from "./components/TwitchOverlay.vue";

export default {
  name: "App",
  components: { TwitchOverlay },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
