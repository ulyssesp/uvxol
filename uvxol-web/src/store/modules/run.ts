import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent, EventId, VoteOption, VoteOptionId, ActionId } from '@/types';
import * as ty from '@/types';
import * as signalR from "@aspnet/signalr";
import store from '@/store';
import eventStore from './events';
import Socket from './socket';
// import { Entity, World } from 'ecsy';
// import {
//   ChosenVoteOption,
//   Clock,
//   ResetComponent,
//   DependenciesTrigger,
//   DependenciesTriggerSystem,
//   EventTrigger,
//   EventTriggerSystem,
//   RenderableEvent,
//   RenderableFileAction,
//   RenderableVoteAction,
//   Renderer,
//   Reset,
//   TickClock,
//   TimeToggleSystem,
//   TimeToggle,
//   PendingVoteOption,
//   Active,
//   Pending,
//   Finished, TallyVotes, VoteAction, DependenciesSatisfied, EventRendererSystem, ActionRendererSystem, FunMeter, RenderableFunMeterAction
// } from '@/ecs';


const socket = new Socket();

// const votingSignalR = new signalR.HubConnectionBuilder()
//   .withUrl("https://uvxol-httptrigger.azurewebsites.net/api")
//   .build()

// const run = (self: Run) => {
//   const current = performance.now();
//   self.world!.execute(current - self.lastTime, current);
//   self.lastTime = current;
//   self.runHandle = requestAnimationFrame(() => {
//     run(self);
//   });

//   if (self.renderer) {
//     self.time = self.renderer.getComponent(Clock)!.time;
//     self.speed = self.renderer.getComponent(Clock)!.timeScale;
//     self.funMeter = self.renderer.getComponent(FunMeter)!.value;
//   }
// }

@Module({ dynamic: true, name: 'runStore', store })
class Run extends VuexModule {
  // public world: World | undefined;
  // public renderer: Entity | undefined;
  public runHandle: number | undefined;
  public lastTime: number = 0;

  public speed: number = 1;
  public syncTime: number = 0;
  public startTime: number = 0;
  public timeScale: number = 1;
  public time: number = 0;

  public funMeter: number = 0;

  private votingSetup = false;

  private started = false;

  static startEvents: (id?: number) => ActionEvent[] = id =>
    id
      ? [eventStore.events[id]]
      : eventStore.eventsList.filter(e => eventStore.eventsByTrigger[e.id] == null)

  public chosenVoteOptions: number[] = [];
  public events: ty.EventRenderData[] = [];
  public actionList: ty.ActionRenderData<ty.ActionType>[] = [];

  @Action({ commit: 'restart', rawError: true })
  public async start(id?: number) {
    socket.onConnected(() => {
      console.log("hmm")
      socket.send(JSON.stringify({ type: 'fetchState' }))
    });
    return id;
  }

  // @Action({ commit: 'addVote', rawError: true })
  public async chooseVote(va: [string, VoteOptionId, ActionId]) {
    socket.send(JSON.stringify({ type: "vote", voteOptionId: va[1], actionId: va[2], vote: va[0] }))
  }

  // @Action({ commit: 'setVoteOptions', rawError: true })
  public async overrideVoteOptions(vos: VoteOptionId[]) {
    socket.send(JSON.stringify({ type: "overrideVoteOptions", voteOptionIds: vos }))
  }

  @Action({ commit: 'changeTimeScale' })
  public async setTimeScale(timeScale: number) {
    return timeScale;
  }

  @Action({ commit: 'multTimeScale' })
  public async doubleSpeed() {
    return 2;
  }

  @Action({ commit: 'multTimeScale' })
  public async halfSpeed() {
    return 0.5;
  }


  @Mutation
  public async restart(id?: number) {
    // if (!this.world) {
    // this.world = new World();
    // this.world
    //   .registerComponent(TimeToggle)
    //   .registerComponent(DependenciesTrigger)
    //   .registerComponent(DependenciesSatisfied)
    //   .registerComponent(EventTrigger)
    //   .registerComponent(RenderableEvent)
    //   .registerComponent(Renderer)
    //   .registerComponent(PendingVoteOption)
    //   .registerComponent(VoteAction)
    //   .registerComponent(ChosenVoteOption)
    //   .registerComponent(RenderableFileAction)
    //   .registerComponent(RenderableVoteAction)
    //   .registerComponent(ResetComponent)
    //   .registerComponent(Clock)
    //   .registerComponent(Active)
    //   .registerComponent(Pending)
    //   .registerComponent(Finished)
    //   .registerComponent(FunMeter)
    //   .registerComponent(RenderableFunMeterAction)
    //   .registerSystem(TickClock)
    //   .registerSystem(DependenciesTriggerSystem)
    //   .registerSystem(TimeToggleSystem)
    //   .registerSystem(TallyVotes)
    //   .registerSystem(EventTriggerSystem)
    //   .registerSystem(Reset)
    //   .registerSystem(EventRendererSystem)
    //   .registerSystem(ActionRendererSystem);

    // this.renderer = this.world.createEntity()
    //   .addComponent(Renderer, { events: this.events, actions: this.actionList, socket })
    //   .addComponent(Clock)
    //   .addComponent(FunMeter);
    if (!this.started) {
      socket.addListener(msg => {
        switch (msg.type) {
          case "replaceState":
            this.actionList = msg.actions;
            this.events = msg.events;
            this.syncTime = performance.now();
            this.startTime = msg.time;
            this.time = this.startTime;
            this.speed = msg.speed;
            break;
          case "speedChange":
            this.syncTime = performance.now();
            this.startTime = msg.time;
            this.time = this.startTime;
            this.speed = msg.speed;
            break;
          case "addAction":
            this.actionList.push(msg.data);
            break;
          case "addEvent":
            this.events.push(msg.data);
            break;
          case "removeEvent":
            this.events = this.events.filter(e => e.id !== msg.id);
            break;
          case "removeAction":
            this.actionList = this.actionList.filter(a => a.id !== msg.id);
            break;
        }
      });

      this.started = true;

      const updateTime = () => {
        this.time = this.startTime + (performance.now() - this.syncTime) * this.speed;
        setTimeout(updateTime, 1000);
      }

      updateTime();
    }

    socket.send(JSON.stringify({ type: 'restart' }))
    socket.send(JSON.stringify({ type: 'setPlaySpeed', speed: 1 }))
  }

  // if(!this.votingSetup) {
  //   const self = this;

  //   this.votingSetup = true;
  // }

  // if(this.runHandle) {
  //   cancelAnimationFrame(this.runHandle);
  // }

  // this.world.createEntity().addComponent(ResetComponent);

  // const self = this;
  // run(self);

  // Run.startEvents(id).forEach(e => {
  //   const eventData = eventStore.events[e.id];
  //   this.world!.createEntity()
  //     .addComponent(DependenciesTrigger, {
  //       dependencies: eventData.dependencies.map(vo => vo.id)
  //     })
  //     .addComponent(EventTrigger, {
  //       eventId: e.id,
  //     })
  //     .addComponent(TimeToggle, {
  //       on: 0,
  //       off: 1000
  //     })
  // });

  // this.runHandle = requestAnimationFrame(() => run(self));
  //}

  // @Mutation
  // public async setVoteOptions(vos: VoteOptionId[]) {
  //   this.chosenVoteOptions = vos;
  // }

  @Mutation
  public async changeTimeScale(timeScale: number) {
    // this.renderer!.getMutableComponent(Clock)!.timeScale = timeScale;
    socket.send(JSON.stringify({ type: 'setPlaySpeed', speed: timeScale }))
  }

  @Mutation
  public async multTimeScale(timeScaleMult: number) {
    socket.send(JSON.stringify({ type: 'setPlaySpeed', speed: this.speed * timeScaleMult }))
  }
}

export default getModule(Run);
