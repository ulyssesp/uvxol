import { Entity, World } from "ecsy";
import {
  ChosenVoteOption,
  Clock,
  ResetComponent,
  DependenciesTrigger,
  DependenciesTriggerSystem,
  EventTrigger,
  EventTriggerSystem,
  RenderableEvent,
  RenderableFileAction,
  RenderableVoteAction,
  Run,
  Reset,
  TickClock,
  TimeToggleSystem,
  TimeToggle,
  PendingVoteOption,
  Active,
  Pending,
  Finished, TallyVotes, VoteAction, DependenciesSatisfied, EventRendererSystem, ActionRendererSystem, Meter, RenderableMeterAction, ActionEventStore, VoteOptionStore, ActionStore
} from './ecs';
import { Action, ActionEvent, ActionRenderData, ActionType, EventRenderData, ServerAction, TypesActionMap, VoteOption, ServerEvent, Runner } from "./types";
import * as signalR from "@microsoft/signalr";
import WebSocket from "ws";
import { getActions, getEvents, getVoteOptions, startVote, voteOptionsUri } from "./api";

const process = require('process');

const world = new World();
world
  .registerComponent(TimeToggle)
  .registerComponent(DependenciesTrigger)
  .registerComponent(DependenciesSatisfied)
  .registerComponent(EventTrigger)
  .registerComponent(RenderableEvent)
  .registerComponent(Run)
  .registerComponent(PendingVoteOption)
  .registerComponent(VoteAction)
  .registerComponent(ChosenVoteOption)
  .registerComponent(RenderableFileAction)
  .registerComponent(RenderableVoteAction)
  .registerComponent(ResetComponent)
  .registerComponent(Clock)
  .registerComponent(Active)
  .registerComponent(Pending)
  .registerComponent(Finished)
  .registerComponent(Meter)
  .registerComponent(RenderableMeterAction)
  .registerComponent(ActionEventStore)
  .registerComponent(VoteOptionStore)
  .registerComponent(ActionStore)
  .registerSystem(TickClock)
  .registerSystem(DependenciesTriggerSystem)
  .registerSystem(TimeToggleSystem)
  .registerSystem(TallyVotes)
  .registerSystem(EventTriggerSystem)
  .registerSystem(Reset)
  .registerSystem(EventRendererSystem)
  .registerSystem(ActionRendererSystem);

let store =
  world.createEntity()
    .addComponent(ActionEventStore, { data: new Map() })
    .addComponent(ActionStore, { data: new Map() })
    .addComponent(VoteOptionStore, { data: new Map() })

const runner: Runner = {
  addAction: (action: ActionRenderData<ActionType>) => {
    broadcast(JSON.stringify({
      type: "addAction",
      data: action
    }))
  },
  addEvent: (event: EventRenderData) => {
    broadcast(JSON.stringify({
      type: "addEvent",
      data: event
    }))
  },
  removeAction: (action: ActionRenderData<ActionType>) => {
    broadcast(JSON.stringify({
      type: "removeAction",
      id: action.id,
      eventId: action.eventId
    }))

    if (action.type === "vote") {
      data.activeVotes.set(action.zone, []);
      startVote(action.zone, []);
    }
  },
  removeEvent: (id: number) => {
    broadcast(JSON.stringify({
      type: "removeEvent",
      id
    }))
  },
  restart: () => {
    broadcast(JSON.stringify({
      type: "restart"
    }))
  },
  setPlaySpeed: (speed: number, time: number) => {
    broadcast(JSON.stringify({
      type: "speedChange",
      speed,
      time
    }))
  },
  startVote: (zone: string, voteOptions: { name: string, voteOptionId: number, actionId: number }[]) => {
    data.activeVotes.set('zone', voteOptions);
    startVote(zone, voteOptions)
  }
}

const data: {
  events: EventRenderData[],
  actions: ActionRenderData<ActionType>[],
  lastTime: number,
  runner: Runner,
  runHandle: NodeJS.Timeout | undefined,
  activeVotes: Map<string, { name: string, voteOptionId: number, actionId: number }[]>
} = {
  events: [],
  actions: [],
  lastTime: 0,
  runHandle: undefined,
  runner,
  activeVotes: new Map()
}

const votingSignalR = new signalR.HubConnectionBuilder()
  .withUrl("https://uvxol-httptrigger.azurewebsites.net/api")
  .build();

votingSignalR.on("NewVote", ({ voter, voteOptionId, actionId }: { voter: string, voteOptionId: number, actionId: number }) => {
  if (voter !== "control") {
    world!.createEntity()
      .addComponent(PendingVoteOption, { voter, actionId, voteOptionId });
  }
});

votingSignalR.on("NewClient", () => {
  for (const entry of data.activeVotes.entries()) {
    startVote(entry[0], entry[1]);
  }
});


votingSignalR.start().catch(err => console.error(err));

const wss = new WebSocket.Server({ port: 9982 });
const broadcast = (msg: string) => {
  wss.clients.forEach(ws => ws.send(msg));
}

const renderer: Entity = world.createEntity()
  .addComponent(Run, { events: data.events, actions: data.actions, runner })
  .addComponent(Clock)
  .addComponent(Meter);

wss.on('connection', ws => {
  console.log("connected " + ws)
  const status = { connected: true };
  const ping = setInterval(() => {
    if (!status.connected) {
      return ws.terminate()
    }

    status.connected = false;
    ws.ping();
  }, 30000);

  ws.on('pong', () => status.connected = true);
  ws.on('close', () => {
    clearInterval(ping);
  });

  ws.on('message', (msgjson: string) => {
    console.log("message: " + msgjson)
    const msg: ServerEvent = JSON.parse(msgjson);
    switch (msg.type) {
      case "setPlaySpeed":
        if (renderer) {
          const clock = renderer.getMutableComponent<Clock>(Clock)!;
          clock.timeScale = msg.speed;
          runner.setPlaySpeed(msg.speed, clock.time)
        }
        break;
      case "restart":
        restart()
        break;
      case "fetchState":
        {
          const clock = renderer.getMutableComponent<Clock>(Clock)!;
          ws.send(JSON.stringify({
            type: "replaceState",
            events: data.events,
            actions: data.actions,
            time: renderer.getComponent<Clock>(Clock)!.time,
            speed: renderer.getComponent<Clock>(Clock)!.timeScale,
            funMeter: renderer.getComponent<Meter>(Meter)!.fun,
            budgetMeter: renderer.getComponent<Meter>(Meter)!.budget
          }))
        }
        break;
    }
  })
});


const startWorld = (events: ActionEvent[], actions: Action<ActionType>[], voteOptions: VoteOption[], id?: number) => {
  if (data.runHandle) {
    clearTimeout(data.runHandle);
  }

  runner.setPlaySpeed(1, 0);

  const eventStore = store.getMutableComponent<ActionEventStore>(ActionEventStore)!;

  eventStore.data = new Map(events.map(e => [e.id, e]));
  store.getMutableComponent<ActionStore>(ActionStore)!.data = new Map(actions.map(e => [e.id, e]));
  store.getMutableComponent<VoteOptionStore>(VoteOptionStore)!.data = new Map(voteOptions.map(e => [e.id, e]));

  const eventsByTrigger: Map<number, Set<number>> = new Map();
  events.forEach(e => e.triggers.forEach(t => {
    if (!eventsByTrigger.has(t)) {
      eventsByTrigger.set(t, new Set<number>());
    }
    eventsByTrigger.get(t)!.add(e.id);
  }))


  world.createEntity().addComponent(ResetComponent, {
    events: id
      ? [id]
      : events.filter(e => !eventsByTrigger.has(e.id)).map(e => e.id)
  });

  run()

  const clock = renderer.getMutableComponent<Clock>(Clock)!;
  broadcast(JSON.stringify({
    type: "replaceState",
    events: data.events,
    actions: data.actions,
    time: clock.time,
    speed: clock.timeScale
  }))
}

const run = () => {
  const time = process.hrtime();
  const current = time[0] * 1000 + time[1] / 1000000;
  world!.execute(current - data.lastTime, current);
  data.lastTime = current;
  data.runHandle = setTimeout(run, 16);
}

const restart = (id?: number) =>
  Promise.all([
    getEvents(),
    getActions(),
    getVoteOptions()
  ]).then(res => startWorld(res[0], res[1], res[2], id))
    .catch(err => console.error(err));

restart();