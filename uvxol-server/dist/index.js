"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ecsy_1 = require("ecsy");
const ecs_1 = require("./ecs");
const signalR = __importStar(require("@microsoft/signalr"));
const ws_1 = __importDefault(require("ws"));
const api_1 = require("./api");
const process = require('process');
const world = new ecsy_1.World();
world
    .registerComponent(ecs_1.TimeToggle)
    .registerComponent(ecs_1.DependenciesTrigger)
    .registerComponent(ecs_1.DependenciesSatisfied)
    .registerComponent(ecs_1.EventTrigger)
    .registerComponent(ecs_1.RenderableEvent)
    .registerComponent(ecs_1.Run)
    .registerComponent(ecs_1.PendingVoteOption)
    .registerComponent(ecs_1.VoteAction)
    .registerComponent(ecs_1.ChosenVoteOption)
    .registerComponent(ecs_1.RenderableFileAction)
    .registerComponent(ecs_1.RenderableVoteAction)
    .registerComponent(ecs_1.ResetComponent)
    .registerComponent(ecs_1.Clock)
    .registerComponent(ecs_1.Active)
    .registerComponent(ecs_1.Pending)
    .registerComponent(ecs_1.Finished)
    .registerComponent(ecs_1.FunMeter)
    .registerComponent(ecs_1.RenderableFunMeterAction)
    .registerComponent(ecs_1.ActionEventStore)
    .registerComponent(ecs_1.VoteOptionStore)
    .registerComponent(ecs_1.ActionStore)
    .registerSystem(ecs_1.TickClock)
    .registerSystem(ecs_1.DependenciesTriggerSystem)
    .registerSystem(ecs_1.TimeToggleSystem)
    .registerSystem(ecs_1.TallyVotes)
    .registerSystem(ecs_1.EventTriggerSystem)
    .registerSystem(ecs_1.Reset)
    .registerSystem(ecs_1.EventRendererSystem)
    .registerSystem(ecs_1.ActionRendererSystem);
let store = world.createEntity()
    .addComponent(ecs_1.ActionEventStore, { data: new Map() })
    .addComponent(ecs_1.ActionStore, { data: new Map() })
    .addComponent(ecs_1.VoteOptionStore, { data: new Map() });
const runner = {
    addAction: (action) => {
        broadcast(JSON.stringify({
            type: "addAction",
            data: action
        }));
    },
    addEvent: (event) => {
        broadcast(JSON.stringify({
            type: "addEvent",
            data: event
        }));
    },
    removeAction: (id, eventId) => {
        broadcast(JSON.stringify({
            type: "removeAction",
            id,
            eventId
        }));
    },
    removeEvent: (id) => {
        broadcast(JSON.stringify({
            type: "removeEvent",
            id
        }));
    },
    restart: () => {
        broadcast(JSON.stringify({
            type: "restart"
        }));
    },
    setPlaySpeed: (speed, time) => {
        broadcast(JSON.stringify({
            type: "speedChange",
            speed,
            time
        }));
    },
    startVote: (zone, voteOptions) => api_1.startVote(zone, voteOptions)
};
const data = {
    events: [],
    actions: [],
    lastTime: 0,
    runHandle: undefined,
    runner
};
const votingSignalR = new signalR.HubConnectionBuilder()
    .withUrl("https://uvxol-httptrigger.azurewebsites.net/api")
    .build();
votingSignalR.on("NewVote", ({ voter, voteOptionId, actionId }) => {
    if (voter !== "control") {
        world.createEntity()
            .addComponent(ecs_1.PendingVoteOption, { voter, actionId, voteOptionId });
    }
});
votingSignalR.start().catch(err => console.error(err));
const wss = new ws_1.default.Server({ port: 9982 });
const broadcast = (msg) => {
    wss.clients.forEach(ws => ws.send(msg));
};
const renderer = world.createEntity()
    .addComponent(ecs_1.Run, { events: data.events, actions: data.actions, runner })
    .addComponent(ecs_1.Clock)
    .addComponent(ecs_1.FunMeter);
wss.on('connection', ws => {
    const status = { connected: true };
    const ping = setInterval(() => {
        if (!status.connected) {
            return ws.terminate();
        }
        status.connected = false;
        ws.ping();
    }, 30000);
    ws.on('pong', () => status.connected = true);
    ws.on('close', () => {
        clearInterval(ping);
    });
    ws.on('message', (msgjson) => {
        console.log("message: " + msgjson);
        const msg = JSON.parse(msgjson);
        switch (msg.type) {
            case "setPlaySpeed":
                if (renderer) {
                    const clock = renderer.getMutableComponent(ecs_1.Clock);
                    clock.timeScale = msg.speed;
                    runner.setPlaySpeed(msg.speed, clock.time);
                }
                break;
            case "restart":
                restart();
                break;
            case "fetchState":
                {
                    const clock = renderer.getMutableComponent(ecs_1.Clock);
                    ws.send(JSON.stringify({
                        type: "replaceState",
                        events: data.events,
                        actions: data.actions,
                        time: renderer.getComponent(ecs_1.Clock).time,
                        speed: renderer.getComponent(ecs_1.Clock).timeScale
                    }));
                }
                break;
        }
    });
});
const startWorld = (events, actions, voteOptions, id) => {
    console.log("starting " + events.length);
    if (data.runHandle) {
        clearTimeout(data.runHandle);
    }
    runner.setPlaySpeed(1, 0);
    const eventStore = store.getMutableComponent(ecs_1.ActionEventStore);
    eventStore.data = new Map(events.map(e => [e.id, e]));
    store.getMutableComponent(ecs_1.ActionStore).data = new Map(actions.map(e => [e.id, e]));
    store.getMutableComponent(ecs_1.VoteOptionStore).data = new Map(voteOptions.map(e => [e.id, e]));
    const eventsByTrigger = new Map();
    events.forEach(e => e.triggers.forEach(t => {
        if (!eventsByTrigger.has(t)) {
            eventsByTrigger.set(t, new Set());
        }
        eventsByTrigger.get(t).add(e.id);
    }));
    world.createEntity().addComponent(ecs_1.ResetComponent, {
        events: id
            ? [id]
            : events.filter(e => !eventsByTrigger.has(e.id)).map(e => e.id)
    });
    run();
    const clock = renderer.getMutableComponent(ecs_1.Clock);
    broadcast(JSON.stringify({
        type: "replaceState",
        events: data.events,
        actions: data.actions,
        time: clock.time,
        speed: clock.timeScale
    }));
};
const run = () => {
    const time = process.hrtime();
    const current = time[0] * 1000 + time[1] / 1000000;
    world.execute(current - data.lastTime, current);
    data.lastTime = current;
    data.runHandle = setTimeout(run, 16);
};
const restart = (id) => Promise.all([
    api_1.getEvents(),
    api_1.getActions(),
    api_1.getVoteOptions()
]).then(res => startWorld(res[0], res[1], res[2], id))
    .catch(err => console.error(err));
restart();
