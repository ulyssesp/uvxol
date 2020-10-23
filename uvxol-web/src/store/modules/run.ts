import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent, EventId, VoteOption, VoteOptionId, ActionId } from '@/types';
import * as ty from '@/types';
import * as signalR from "@aspnet/signalr";
import store from '@/store';
import eventStore from './events';
import Socket from './socket';
import { Entity, World } from 'ecsy';
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
  Renderer,
  Reset,
  TickClock,
  TimeToggleSystem,
  TimeToggle,
  PendingVoteOption,
  Active,
  Pending,
  Finished, TallyVotes, VoteAction, DependenciesSatisfied, EventRendererSystem, ActionRendererSystem, FunMeter, RenderableFunMeterAction
} from '@/ecs';


const socket = new Socket();

const votingSignalR = new signalR.HubConnectionBuilder()
  .withUrl("https://uvxol-httptrigger.azurewebsites.net/api")
  .build()

const run = (self: Run) => {
  const current = performance.now();
  self.world!.execute(current - self.lastTime, current);
  self.lastTime = current;
  self.runHandle = requestAnimationFrame(() => {
    run(self);
  });

  if (self.renderer) {
    self.time = self.renderer.getComponent(Clock)!.time;
    self.speed = self.renderer.getComponent(Clock)!.timeScale;
    self.funMeter = self.renderer.getComponent(FunMeter)!.value;
  }
}

@Module({ dynamic: true, name: 'runStore', store })
class Run extends VuexModule {
  public world: World | undefined;
  public renderer: Entity | undefined;
  public runHandle: number | undefined;
  public lastTime: number = 0;

  public speed: number = 1;
  public time: number = 0;

  public funMeter: number = 0;

  private votingSetup = false;

  static startEvents: (id?: number) => ActionEvent[] = id =>
    id
      ? [eventStore.events[id]]
      : eventStore.eventsList.filter(e => eventStore.eventsByTrigger[e.id] == null)

  public chosenVoteOptions: number[] = [];
  public events: ty.EventRenderData[] = [];
  public actionList: ty.ActionRenderData<ty.ActionType>[] = [];

  @Action({ commit: 'restart', rawError: true })
  public async start(id?: number) {
    return id;
  }

  @Action({ commit: 'addVote', rawError: true })
  public async chooseVote(va: [VoteOptionId, ActionId]) {
    return va;
  }

  @Action({ commit: 'setVoteOptions', rawError: true })
  public async overrideVoteOptions(vos: VoteOptionId[]) {
    return vos;
  }

  @Action({ commit: 'changeTimeScale', rawError: true })
  public async setTimeScale(timeScale: number) {
    return timeScale;
  }

  @Action({ commit: 'multTimeScale', rawError: true })
  public async doubleSpeed() {
    return 2;
  }

  @Action({ commit: 'multTimeScale', rawError: true })
  public async halfSpeed() {
    return 0.5;
  }


  @Mutation
  public async restart(id?: number) {
    if (!this.world) {
      this.world = new World();
      this.world
        .registerComponent(TimeToggle)
        .registerComponent(DependenciesTrigger)
        .registerComponent(DependenciesSatisfied)
        .registerComponent(EventTrigger)
        .registerComponent(RenderableEvent)
        .registerComponent(Renderer)
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
        .registerComponent(FunMeter)
        .registerComponent(RenderableFunMeterAction)
        .registerSystem(TickClock)
        .registerSystem(DependenciesTriggerSystem)
        .registerSystem(TimeToggleSystem)
        .registerSystem(TallyVotes)
        .registerSystem(EventTriggerSystem)
        .registerSystem(Reset)
        .registerSystem(EventRendererSystem)
        .registerSystem(ActionRendererSystem);

      this.renderer = this.world.createEntity()
        .addComponent(Renderer, { events: this.events, actions: this.actionList, socket })
        .addComponent(Clock)
        .addComponent(FunMeter);
    }

    if (!this.votingSetup) {
      const self = this;
      console.log(this);
      votingSignalR.on("NewVote", ({ voter, voteOptionId, actionId }: { voter: string, voteOptionId: number, actionId: number }) => {
        console.log("received");
        console.log(voter)
        console.log(voteOptionId);
        console.log(actionId);
        if (voter !== "control") {
          store.dispatch("chooseVote", [voteOptionId, actionId]);
          // this.addVoteToWorld([voteOptionId, actionId]);
        }
      })

      votingSignalR.start().catch(err => console.error(err));
    }

    if (this.runHandle) {
      cancelAnimationFrame(this.runHandle);
    }

    this.world.createEntity().addComponent(ResetComponent);

    const self = this;
    run(self);

    Run.startEvents(id).forEach(e => {
      const eventData = eventStore.events[e.id];
      this.world!.createEntity()
        .addComponent(DependenciesTrigger, {
          dependencies: eventData.dependencies.map(vo => vo.id)
        })
        .addComponent(EventTrigger, {
          eventId: e.id,
        })
        .addComponent(TimeToggle, {
          on: 0,
          off: 1000
        })
    });

    this.runHandle = requestAnimationFrame(() => run(self));
  }

  @Mutation
  public async addVote([v, a]: [VoteOptionId, ActionId]) {
    fetch("https://uvxol-httptrigger.azurewebsites.net/api/voting", {
      method: "post",
      body: JSON.stringify({
        voter: "control",
        voteOptionId: v,
        actionId: a
      })
    })

    this.world!.createEntity()
      .addComponent(PendingVoteOption, { actionId: a, voteOptionId: v });
  }

  @Mutation
  public async setVoteOptions(vos: VoteOptionId[]) {
    this.chosenVoteOptions = vos;
  }

  @Mutation
  public async changeTimeScale(timeScale: number) {
    this.renderer!.getMutableComponent(Clock)!.timeScale = timeScale;
    socket.send(JSON.stringify({ action: 'setPlaySpeed', speed: timeScale }))
  }

  @Mutation
  public async multTimeScale(timeScaleMult: number) {
    const clock = this.renderer!.getMutableComponent(Clock)!;
    clock.timeScale *= timeScaleMult;
    socket.send(JSON.stringify({ action: 'setPlaySpeed', speed: clock.timeScale }))
  }
}

export default getModule(Run);
