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
const zoneChannelId = {
  FILM: 601433045,
  STAGE: 601434020,
  HOUSE: 601435410,
  PANOPTICON: 443816645,
};

const authResult = {
  channelId: undefined,
  userId: undefined,
};

Twitch.ext.onAuthorized((authCallback) => {
  console.log(authCallback.channelId);
  Object.assign(authResult, authCallback);
});

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
      votingSignalR.on("NewVoteOptions", ({ zone, voteOptions }) => {
        if (zoneChannelId[zone] == authResult.channelId) {
          this.voteOptions = voteOptions;
        }
      });
      votingSignalR.start().catch((err) => console.error(err));
    });
  },
  methods: {
    vote: function (id, actionId) {
      console.log(authResult.userId);
      fetch("https://uvxol-httptrigger.azurewebsites.net/api/voting", {
        method: "post",
        body: JSON.stringify({
          voter: authResult.userId,
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
