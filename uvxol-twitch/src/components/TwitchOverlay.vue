<template>
  <div class="hello">
    <h1>Voting</h1>
    <p>Vote for stuff!</p>
    <ul>
      <li
        class="voteoption"
        v-for="voteOption in voteOptions"
        :key="voteOption.id"
        v-on:click="vote(voteOption.id, voteOption.actionId)"
        @click.stop
        @click.prevent
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
  Object.assign(authResult, authCallback);
  fetch("https://uvxol-httptrigger.azurewebsites.net/api/voting", {
    method: "post",
    body: JSON.stringify({
      voter: authResult.userId,
      voteOptionId: id,
      actionId: actionId,
    }),
  });
});

const votingSignalR = new signalR.HubConnectionBuilder()
  .withUrl("https://uvxol-httptrigger.azurewebsites.net/api")
  .build();

votingSignalR.on("Boop", () => console.log("booped"));

export default {
  name: "TwitchOverlay",
  props: {
    msg: String,
  },
  data: function () {
    return {
      voteOptions: [
        { name: "get", id: 0 },
        { name: "that", id: 1 },
        { name: "bread", id: 2 },
      ],
    };
  },
  mounted: function () {
    this.$nextTick(function () {
      votingSignalR.on("NewVoteOptions", ({ zone, voteOptions }) => {
        if (zoneChannelId[zone] == authResult.channelId) {
          this.voteOptions = voteOptions;
        }
      });
      if (votingSignalR.state === signalR.HubConnectionState.Disconnected) {
        votingSignalR
          .start()
          .catch((err) => console.error(err))
          .then(() => {
            console.log("connected");
            votingSignalR.send("Boop");
            votingSignalR
              .invoke("Boop")
              .catch((err) => console.error(err))
              .then(() => console.log("booper"));
            votingSignalR.invoke("NewVote", {
              voter: "hi",
              voteOptionId: 0,
              actionId: 0,
            });
            // votingSignalR.invoke("NewVote");
          });
      }
    });
  },
  methods: {
    vote: function (id, actionId) {
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
.voteoption {
  cursor: pointer;
}
.voteoption:hover {
  color: red;
}

.voteoption:active {
  color: blue;
}
</style>
