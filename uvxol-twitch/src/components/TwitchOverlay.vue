<template>
  <div class="hello">
    <h1>Voting</h1>
    <p>Vote for stuff!</p>
    <ul>
      <li
        v-for="voteOption in voteOptions"
        :key="voteOption.id"
        v-on:click="vote(voteOption.id, voteOption.actionId)"
      >
        {{ voteOption.name }}
      </li>
    </ul>
  </div>
</template>

<script>
const votingSignalR = new signalR.HubConnectionBuilder()
  .withUrl("https://uvxol-httptrigger.azurewebsites.net/api")
  .build();
export default {
  name: "TwitchOverlay",
  props: {
    msg: String,
  },
  data: function () {
    return {
      voteOptions: [],
    };
  },
  mounted: function () {
    this.$nextTick(function () {
      votingSignalR.on("NewVoteOptions", ({ voteOptions }) => {
        console.log(voteOptions);
        this.voteOptions = voteOptions;
      });
      votingSignalR.start().catch((err) => console.error(err));
    });
  },
  methods: {
    vote: function (id, actionId) {
      console.log(id);
      console.log(actionId);
      fetch("https://uvxol-httptrigger.azurewebsites.net/api/voting", {
        method: "post",
        body: JSON.stringify({
          voter: "twitch",
          voteOptionId: id,
          actionId: actionId,
        }),
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
