import { Component, Types, ArrayPropType, System, Entity, TagComponent, Not } from 'ecsy';
import { Action, ActionEvent, ActionType, ViewAction, VoteOptionId, VoteActionFields, FileActionFields, EventRenderData, VoteOption, ActionRenderData, actionVoteOptions, Runner, isMeterAction } from './types';

export class Store<A> extends Component<{ data: Map<number, A> }> {
  data = new Map<number, A>();
  static schema = {
    data: { type: Types.Ref }
  }
}

export class ActionEventStore extends Store<ActionEvent> { };
export class ActionStore extends Store<Action<ActionType>> { };
export class VoteOptionStore extends Store<VoteOption> { };

export class Clock extends Component<{ time: number, timeScale: number }> {
  time: number = 0;
  timeScale: number = 1;
}

export class TimeToggle extends Component<{
  on: number,
  off: number,
}> {
  on: number = 0;
  off: number = 0;
  static schema = {
    off: { type: Types.Number },
    on: { type: Types.Number },
  }
};

export class ChosenVoteOption extends Component<{ id: number, name: string }> {
  id: number = 0;
  name: string = "";
  static schema = {
    id: { type: Types.Number },
    name: { type: Types.String }
  }
}

export class PendingVoteOption extends Component<{ voter: string, actionId: number, voteOptionId: number }> {
  voter: string = "";
  actionId: number = -1;
  voteOptionId: number = -1;
  static schema = {
    voter: { type: Types.String },
    actionId: { type: Types.Number },
    voteOptionId: { type: Types.Number }
  }
}

export class VoteAction extends Component<{ id: number, votes: number[] }> {
  id: number = -1;
  votes: number[] = [];
  static schema = {
    id: { type: Types.Number },
    votes: { type: Types.Number }
  }
}


export class DependenciesTrigger extends Component<{
  dependencies: number[];
}> {
  dependencies: number[] = [];
  static schema = {
    dependencies: { type: Types.Array },
  }
}

export class DependenciesSatisfied extends TagComponent { };

export class EventTrigger extends Component<{ eventId: number }> {
  eventId: number = -1;
  triggerId: number = -1;
  static schema = {
    eventId: { type: Types.Number },
    triggerId: { type: Types.Number },
  }
}

export class RenderableEvent extends Component<EventRenderData> {
  id: number = -1;
  name: string = "";
  start: number = 0;
  end: number = 0;
  eventId: number = -1;
  triggerId: number = -1;
  static schema = {
    id: { type: Types.Number },
    name: { type: Types.String },
    start: { type: Types.Number },
    end: { type: Types.Number },
    triggerId: {type: Types.Number},
  }
}

export class RenderableVoteAction extends Component<ActionRenderData<"vote">> {
  id: number = -1;
  eventId: number = -1;
  name: string = "";
  zone: string = "";
  location: string = "";
  voteOptions: VoteOption[] = [];
  text: string = "";
  type: "vote" = "vote";

  static schema = {
    id: { type: Types.Number },
    name: { type: Types.String },
    zone: { type: Types.String },
    location: { type: Types.String },
    voteOptions: { type: Types.Array },
    text: { type: Types.String },
    type: { type: Types.String },
    eventId: { type: Types.Number }
  }
}

export class RenderableFileAction extends Component<ActionRenderData<"video">> {
  id: number = -1;
  eventId: number = -1;
  name: string = "";
  zone: string = "";
  location: string = "";
  filePath: string = "";
  type: "video" = "video";

  static schema = {
    id: { type: Types.Number },
    name: { type: Types.String },
    zone: { type: Types.String },
    location: { type: Types.String },
    filePath: { type: Types.String },
    type: { type: Types.String },
    eventId: { type: Types.Number }
  }
}

export class RenderableMeterAction extends Component<ActionRenderData<"meter">> {
  id: number = -1;
  eventId: number = -1;
  name: string = "";
  zone: string = "";
  location: string = "";
  type: "meter" = "meter";
  meterType: "fun" | "budget" = "fun";
  value: number = 0;

  static schema = {
    id: { type: Types.Number },
    name: { type: Types.String },
    zone: { type: Types.String },
    location: { type: Types.String },
    type: { type: Types.String },
    eventId: { type: Types.Number },
    meterType: { type: Types.String },
    value: { type: Types.Number },
  }
}

function isRenderableVoteAction(a: RenderableFileAction | RenderableVoteAction): a is RenderableVoteAction {
  return a.type === "vote";
}

function isRenderableFileAction(a: RenderableFileAction | RenderableVoteAction): a is RenderableFileAction {
  return a.type !== "vote";
}

export class Run extends Component<{ events: EventRenderData[], actions: ActionRenderData<ActionType>[], runner: Runner }> {
  events: EventRenderData[] = [];
  actions: ActionRenderData<ActionType>[] = [];
  runner: Runner | undefined;
  static schema = {
    events: { type: Types.Ref },
    actions: { type: Types.Ref },
    runner: { type: Types.Ref }
  }
}

export class Meter extends Component<{ fun: number, budget: number }> {
  fun: number = 0;
  budget: number = 0;
  static schema = {
    fun: { type: Types.Number },
    budget: { type: Types.Number }
  }
}

export class ResetComponent extends Component<{ events: number[] }> {
  events: number[] = [];
  static schema = {
    events: { type: Types.Array }
  }
};

export class Active extends TagComponent { };
export class Pending extends TagComponent { };
export class Finished extends TagComponent { };


//////////////////////
// Systems


export class Reset extends System {
  static queries = {
    reset: { components: [ResetComponent], listen: { added: true } },
    chosenVoteOptions: { components: [ChosenVoteOption] },
    eventTriggers: { components: [EventTrigger] },
    renderableEvents: { components: [RenderableEvent] },
    renderer: { components: [Run] },
    renderableVoteActions: { components: [RenderableVoteAction] },
    renderableFileActions: { components: [RenderableFileAction] },
    clock: { components: [Clock] },
    eventStore: {
      components: [ActionEventStore]
    },
    actionStore: {
      components: [ActionStore]
    },
    voteOptionStore: {
      components: [VoteOptionStore]
    },
  }
  execute(delta: number, time: number): void {
    if (this.queries.reset.added!.length > 0) {
      removeEntities(this.queries.chosenVoteOptions.results);
      removeEntities(this.queries.eventTriggers.results);
      removeEntities(this.queries.renderableEvents.results);
      removeEntities(this.queries.renderableVoteActions.results);
      removeEntities(this.queries.renderableFileActions.results);
      this.queries.clock.results[0].getMutableComponent<Clock>(Clock)!.time = 0;

      const renderer = this.queries.renderer.results[0].getMutableComponent<Run>(Run)!;
      renderer.events.splice(0, renderer.events.length);

      if (renderer.runner) {
        renderer.runner.restart()
      }

      const eventStore = this.queries.eventStore.results[0].getComponent<ActionEventStore>(ActionEventStore);
      const actionStore = this.queries.eventStore.results[0].getComponent<ActionStore>(ActionStore);
      const voteOptionStore = this.queries.voteOptionStore.results[0].getComponent<VoteOptionStore>(VoteOptionStore);

      this.queries.reset.added![0].getComponent<ResetComponent>(ResetComponent)!.events.forEach(e => {
        const event = eventStore?.data.get(e)!;
        this.world.createEntity()
          .addComponent(DependenciesTrigger, {
            dependencies: event.dependencies.map(vo => vo.id)
          })
          .addComponent(EventTrigger, {
            eventId: e,
            triggerId: -1
          })
          .addComponent(TimeToggle, {
            on: 0,
            off: 1000
          })
      });

      this.queries.reset.added![0].remove();
    }
  }
}


const removeEntities = (entities: Entity[]) => {
  for (let i = entities.length - 1; i >= 0; i--) {
    entities[i].remove();
  }
}

export class TickClock extends System {
  static queries = {
    timeActivations: {
      components: [Clock]
    }
  }

  execute(delta: number, time: number): void {
    this.queries.timeActivations.results.forEach(entity => {
      const clock = entity.getMutableComponent<Clock>(Clock)!;
      clock.time += delta * clock.timeScale;
    });
  }
}

export class TimeToggleSystem extends System {
  static queries = {
    timeToggles: {
      components: [TimeToggle]
    },
    clock: {
      components: [Clock]
    }
  }

  execute(delta: number, time: number): void {
    const clock = this.queries.clock.results[0].getComponent<Clock>(Clock)!;
    this.queries.timeToggles.results.forEach(entity => {
      const timeEntity = entity.getMutableComponent<TimeToggle>(TimeToggle)!;
      if (clock.time < timeEntity.on && !entity.hasComponent(Pending)) {
        entity.removeComponent(Active);
        entity.removeComponent(Finished);
        entity.addComponent(Pending);
      } else if (clock.time > timeEntity.off && !entity.hasComponent(Finished)) {
        entity.removeComponent(Pending);
        entity.removeComponent(Active);
        entity.addComponent(Finished);
      } if (clock.time >= timeEntity.on && clock.time <= timeEntity.off && !entity.hasComponent(Active)) {
        entity.removeComponent(Pending);
        entity.removeComponent(Finished);
        entity.addComponent(Active);
      }
    });
  }
}

export class TallyVotes extends System {
  static queries = {
    pendingVoteOptions: {
      components: [PendingVoteOption]
    },
    finishedVotes: {
      components: [VoteAction, Finished],
      listen: { added: true }
    }
  }
  execute(delta: number, time: number): void {
    if(!this.queries.finishedVotes.added) {
      return;
    }

    this.queries.finishedVotes.added!.forEach(entity => {
      const voteAction = entity.getComponent<VoteAction>(VoteAction)!;
      const finalVotes: Map<number, number> = new Map();
      voteAction.votes.forEach(voteOption => finalVotes.set(voteOption, 0));

      const countedVoters = new Set<string>();
      this.queries.pendingVoteOptions.results.forEach(pendingVote => {
        const option = pendingVote.getComponent<PendingVoteOption>(PendingVoteOption)!;
        if (option.actionId === voteAction.id && !countedVoters.has(option.voter)) {
          if (option.voter != "control") {
            countedVoters.add(option.voter);
          }

          finalVotes.set(option.voteOptionId, finalVotes.get(option.voteOptionId)! + 1);

          pendingVote.remove();
        }
      });

      const max = Math.max(...finalVotes.values());
      const winners = [...finalVotes].filter(([id, count]: [number, number]) => count === max);
      if(winners.length > 0) {
        const winner = winners[Math.floor(Math.random() * winners.length)][0];
        entity.addComponent(ChosenVoteOption, { id: winner });
      }
      entity.removeComponent(VoteAction);
    })
  }
}

export class DependenciesTriggerSystem extends System {
  static queries = {
    dependents: {
      components: [DependenciesTrigger, Active],
    },
    chosenVoteOptions: {
      components: [ChosenVoteOption]
    }
  }

  execute(delta: number, time: number): void {
    this.queries.dependents.results.forEach(entity => {
      const depTrigger = entity.getMutableComponent<DependenciesTrigger>(DependenciesTrigger)!;
      const chosenvoteOptions = new Set(this.queries.chosenVoteOptions.results.map(e => e.getComponent<ChosenVoteOption>(ChosenVoteOption)!.id));
      const hasDependencies = depTrigger.dependencies.every(d => chosenvoteOptions.has(d));
      if (hasDependencies && !entity.hasComponent(DependenciesSatisfied)) {
        entity.addComponent(DependenciesSatisfied);
      } else if (!hasDependencies && entity.hasComponent(DependenciesSatisfied)) {
        entity.removeComponent(DependenciesSatisfied)
      }
    })
  }
}


export class EventTriggerSystem extends System {
  static queries = {
    eventTriggers: {
      components: [EventTrigger, TimeToggle, Active, DependenciesSatisfied],
      listen: { added: true }
    },
    chosenVoteOptions: {
      components: [ChosenVoteOption]
    },
    eventStore: {
      components: [ActionEventStore]
    },
    actionStore: {
      components: [ActionStore]
    },
    voteOptionStore: {
      components: [VoteOptionStore]
    },
    meter: {
      components: [Meter]
    }
  }

  execute(delta: number, time: number): void {
    const eventStore = this.queries.eventStore.results[0].getComponent<ActionEventStore>(ActionEventStore)!.data;
    const actionStore = this.queries.actionStore.results[0].getComponent<ActionStore>(ActionStore)!.data;
    const voteOptionStore = this.queries.actionStore.results[0].getComponent<VoteOptionStore>(VoteOptionStore)!.data;

    const chosenVoteOptions = new Set(this.queries.chosenVoteOptions.results.map(cvo => cvo.getComponent<ChosenVoteOption>(ChosenVoteOption)!.id));
    this.queries.eventTriggers.added!.forEach(entity => {
      const eventTrigger = entity.getComponent<EventTrigger>(EventTrigger)!;
      const timeToggle = entity.getMutableComponent<TimeToggle>(TimeToggle)!;
      const eventData = eventStore.get(eventTrigger.eventId)!;

      const on = timeToggle.on + eventData.delay;
      const off = timeToggle.on + eventData.delay + eventData.duration;

      this.world.createEntity()
        .addComponent(RenderableEvent, {
          id: eventData.id,
          name: eventData.name,
          start: on,
          end: off,
          triggerId: eventTrigger.triggerId,
        })
        .addComponent(TimeToggle, { on, off });

      eventData.actions.forEach(a => {
        const actionData = actionStore.get(a.id)!;
        const entity = this.world.createEntity();
        const baseRenderableAction = {
          id: actionData.id,
          eventId: eventData.id,
          name: actionData.name,
          zone: actionData.zone,
          location: actionData.location,
        }

        if (actionData.type === "vote") {
          const meter = this.queries.meter.results[0].getComponent<Meter>(Meter)!;
          const voteOptions = (actionData as Action<"vote">).voteOptions!
            .map(vo => voteOptionStore.get(vo.id)!)
            .filter(vo =>
              (vo.funRequirement === undefined || vo.funRequirement < meter.fun) &&
              (vo.budgetRequirement === undefined || vo.budgetRequirement < meter.budget) &&
              vo.dependencies.every(dep => chosenVoteOptions.has(dep)) &&
              vo.preventions.every(prev => !chosenVoteOptions.has(prev)
              )
            );
          entity
            .addComponent(RenderableVoteAction, Object.assign(baseRenderableAction, {
              eventId: eventData.id,
              type: "vote" as "vote",
              voteOptions,
            }))
            .addComponent(TimeToggle, { on: on, off: off })
            .addComponent(VoteAction, {
              id: actionData.id,
              votes: voteOptions.map(vo => vo.id)
            })

        } else if (actionData.type === "video") {
          const tags = actionVoteOptions(actionData)
            .filter(vo => chosenVoteOptions.has(vo.id))
            .map(vo => vo.shortname);
          const filePath = (actionData as Action<"video">).filePath;
          const extIndex = filePath.indexOf('.');
          entity
            .addComponent(
              RenderableFileAction,
              Object.assign(baseRenderableAction,
                {
                  eventId: eventData.id,
                  type: "video" as "video",
                  filePath:
                    filePath.substring(0, extIndex >= 0 ? extIndex : filePath.length) +
                    (tags.length > 0 ? "-" : "") +
                    tags.join('-') +
                    ".mp4"
                },
              ))
            .addComponent(TimeToggle, { on: on, off: off })
        } else if (isMeterAction(actionData)) {
          const meterType = (actionData as Action<"meter">).funMeterValue !== undefined ? "fun" 
            : (actionData as Action<"meter">).budgetMeterValue !== undefined ? "budget"
            : undefined;

          entity
            .addComponent(
              RenderableMeterAction,
              Object.assign(baseRenderableAction,
                {
                  eventId: eventData.id,
                  type: "meter" as "meter",
                  value: meterType === "fun" ? (actionData as Action<"meter">).funMeterValue : (actionData as Action<"meter">).budgetMeterValue,
                  meterType
                },
              ))
            .addComponent(TimeToggle, { on: on, off: Number.MAX_VALUE })
        }
      });

      eventData.triggers.forEach(t => {
        const triggerData = eventStore.get(t)!;
        this.world.createEntity()
          .addComponent(EventTrigger, { eventId: t, triggerId: eventData.id })
          .addComponent(DependenciesTrigger, { dependencies: triggerData.dependencies.map(vo => vo.id) })
          .addComponent(TimeToggle, { on: off, off: off + 1000 })
      })

      entity.remove();
    });
  }
}

export class EventRendererSystem extends System {
  static queries = {
    renderer: {
      components: [Run]
    },
    pendingEvents: {
      components: [RenderableEvent, Pending],
      listen: {
        added: true,
      }
    },
    activeEvents: {
      components: [RenderableEvent, Active],
      listen: {
        added: true,
      }
    },
    finishedEvents: {
      components: [RenderableEvent, Finished],
      listen: {
        added: true,
      }
    },
    eventStore: {
      components: [ActionEventStore]
    },
  }
  execute(delta: number, time: number): void {
    const eventStore = this.queries.eventStore.results[0].getComponent<ActionEventStore>(ActionEventStore)!.data;
    const renderer = this.queries.renderer.results[0].getComponent<Run>(Run)!;

    const events = this.queries.renderer.results[0].getMutableComponent<Run>(Run)!.events;
    this.queries.pendingEvents.added!.forEach(entity => {
      const renderableEvent: RenderableEvent = entity.getComponent<RenderableEvent>(RenderableEvent)!;
      const event = createOrUpdateEventState(events, "pending", renderableEvent);
      renderer.runner.addEvent(event);
    });


    this.queries.activeEvents.added!.forEach(entity => {
      const renderableEvent: RenderableEvent = entity.getComponent<RenderableEvent>(RenderableEvent)!;
      const event = createOrUpdateEventState(events, "active", renderableEvent);
      renderer.runner.addEvent(event);
    });

    // this.queries.activeEvents.added!.forEach(entity => {
    //   const timeToggle = entity.getComponent(TimeToggle)!;
    //   const renderableEvent = entity.getComponent<RenderableEvent>(RenderableEvent)!;
    //   if(renderableEvent) {
    //     const eventData = eventStore.get(renderableEvent.id)!;
    //   }
    // })

    this.queries.finishedEvents.added!.forEach(entity => {
      const renderableEvent: RenderableEvent = entity.getComponent<RenderableEvent>(RenderableEvent)!;
      const event = createOrUpdateEventState(events, "finished", renderableEvent);
      renderer.runner.addEvent(event);
    });
  }
}


export class ActionRendererSystem extends System {
  static queries = {
    voteActions: {
      components: [RenderableVoteAction, Active],
      listen: {
        added: true,
        removed: true
      }
    },
    fileActions: {
      components: [RenderableFileAction, Active],
      listen: {
        added: true,
        removed: true
      }
    },
    meterActions: {
      components: [RenderableMeterAction, Active],
      listen: {
        added: true,
        removed: true
      }
    },
    renderer: {
      components: [Run]
    },
    meter: {
      components: [Meter]
    }

  }

  execute(delta: number, time: number): void {
    const renderer = this.queries.renderer.results[0].getComponent<Run>(Run)!;
    const meter = this.queries.meter.results[0].getMutableComponent<Meter>(Meter)!;

    this.queries.voteActions.added!.forEach(entity => {
      const renderableAction: RenderableVoteAction = entity.getComponent<RenderableVoteAction>(RenderableVoteAction)!;
      const actionData = {
        id: renderableAction.id,
        eventId: renderableAction.eventId,
        name: renderableAction.name,
        zone: renderableAction.zone,
        location: renderableAction.location,
        voteOptions: renderableAction.voteOptions,
        type: renderableAction.type
      };
      renderer.actions.push(actionData);
      if (renderer.runner) {
        renderer.runner.addAction(actionData);
        renderer.runner.startVote(renderableAction.zone, renderableAction.voteOptions.map(vo => ({
          actionId: renderableAction.id,
          voteOptionId: vo.id,
          name: vo.text
        })))
      }
    });

    this.queries.fileActions.added!.forEach(entity => {
      const renderableAction: RenderableFileAction = entity.getComponent<RenderableFileAction>(RenderableFileAction)!;
      const actionData = {
        id: renderableAction.id,
        eventId: renderableAction.eventId,
        name: renderableAction.name,
        zone: renderableAction.zone,
        location: renderableAction.location,
        filePath: renderableAction.filePath,
        type: renderableAction.type
      };
      renderer.actions.push(actionData);
      if (renderer.runner) {
        renderer.runner.addAction(actionData);
      }
    });

    this.queries.meterActions.added!.forEach(entity => {
      console.log("Adding meter")
      const renderableAction: RenderableMeterAction = entity.getComponent<RenderableMeterAction>(RenderableMeterAction)!;
      if(renderableAction.meterType === "fun") {
        meter.fun += renderableAction.value;
      } else if(renderableAction.meterType === "budget") {
        meter.budget += renderableAction.value;
      }
      const actionData = {
        id: renderableAction.id,
        eventId: renderableAction.eventId,
        name: renderableAction.name,
        zone: renderableAction.zone,
        location: renderableAction.location,
        type: renderableAction.type,
        meterType: renderableAction.meterType,
        value: renderableAction.value
      };
      if (renderer.runner) {
        renderer.runner.addAction(actionData);
      }
    });

    this.queries.voteActions.removed!.forEach(entity => {
      const renderableAction: RenderableVoteAction =
        entity.hasRemovedComponent(RenderableVoteAction)
          ? entity.getRemovedComponent<RenderableVoteAction>(RenderableVoteAction)!
          : entity.getComponent<RenderableVoteAction>(RenderableVoteAction)!;
      renderer.actions.splice(renderer.actions.findIndex(a => a.id === renderableAction.id), 1);
      if (renderer.runner) {
        renderer.runner.removeAction(renderableAction);
      }
    });

    this.queries.fileActions.removed!.forEach(entity => {
      const renderableAction: RenderableFileAction =
        entity.hasRemovedComponent(RenderableFileAction)
          ? entity.getRemovedComponent<RenderableFileAction>(RenderableFileAction)!
          : entity.getComponent<RenderableFileAction>(RenderableFileAction)!;
      renderer.actions.splice(renderer.actions.findIndex(a => a.id === renderableAction.id), 1);
      if (renderer.runner) {
        renderer.runner.removeAction(renderableAction)
      }
    });

    this.queries.meterActions.removed!.forEach(entity => {
      const renderableAction: RenderableMeterAction =
        entity.hasRemovedComponent(RenderableMeterAction)
          ? entity.getRemovedComponent<RenderableMeterAction>(RenderableMeterAction)!
          : entity.getComponent<RenderableMeterAction>(RenderableMeterAction)!;
      if(renderableAction.meterType === "fun") {
        meter.fun -= renderableAction.value;
      } else if (renderableAction.meterType === "budget") {
        meter.budget -= renderableAction.value;
      }
    });
  }
}

const createOrUpdateEventState = (
  events: EventRenderData[], state: "pending" | "active" | "finished",
  renderableEvent: RenderableEvent
) => {
  let event = events.find(e => e.id === renderableEvent.id);
  if (event) {
    event.state = state;
  } else {
    event = {
      id: renderableEvent.id,
      name: renderableEvent.name,
      start: renderableEvent.start,
      end: renderableEvent.end,
      state: state,
      triggerId: renderableEvent.triggerId
    };
    events.push(event);
  }

  return event;
}
