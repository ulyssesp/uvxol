import { Component, Types, ArrayPropType, System, Entity, TagComponent, Not } from 'ecsy';
import { getCompactableComposition } from 'fp-ts/lib/Compactable';
import { extend } from 'vue/types/umd';
import { Action, ActionType, ViewAction, VoteOptionId, VoteActionFields, FileActionFields, EventRenderData, VoteOption, isNotVoteAction, isVoteAction } from './types';
import eventStore from "./store/modules/events";
import actionStore from "./store/modules/actions";
import voteOptionStore from "./store/modules/voteoptions";
import Socket from './store/modules/socket';
import events from './store/modules/events';

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

export class PendingVoteOption extends Component<{ actionId: number, voteOptionId: number }> {
    actionId: number = -1;
    voteOptionId: number = -1;
    static schema = {
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
    static schema = {
        eventId: { type: Types.Number },
    }
}

export class RenderableEvent extends Component<EventRenderData> {
    id: number = -1;
    name: string = "";
    delay: number = 0;
    duration: number = 0;
    static schema = {
        id: { type: Types.Number },
        name: { type: Types.String },
        delay: { type: Types.Number },
        duration: { type: Types.Number },
    }
}

export class RenderableVoteAction extends Component<Action<"vote"> & { eventId: number }> {
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

export class RenderableFileAction extends Component<Action<"video"> & { eventId: number }> {
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

export class Renderer extends Component<{ events: EventRenderData[], actions: Action<ActionType>[], socket?: Socket }> {
    events: EventRenderData[] = [];
    actions: Action<ActionType>[] = [];
    socket: Socket | undefined;
    static schema = {
        events: { type: Types.Ref },
        actions: { type: Types.Ref },
        socket: { type: Types.Ref }
    }
}

export class ResetComponent extends TagComponent { };

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
        renderer: { components: [Renderer] },
        renderableVoteActions: { components: [RenderableVoteAction] },
        renderableFileActions: { components: [RenderableFileAction] },
        clock: { components: [Clock] }
    }
    execute(delta: number, time: number): void {
        if (this.queries.reset.added!.length > 0) {
            removeEntities(this.queries.chosenVoteOptions.results);
            removeEntities(this.queries.eventTriggers.results);
            removeEntities(this.queries.renderableEvents.results);
            removeEntities(this.queries.renderableVoteActions.results);
            removeEntities(this.queries.renderableFileActions.results);
            this.queries.clock.results[0].getMutableComponent(Clock)!.time = 0;

            const renderer = this.queries.renderer.results[0].getMutableComponent(Renderer)!;
            renderer.events.splice(0, renderer.events.length);
            if (renderer.socket) {
                renderer.socket.send(JSON.stringify({ action: "restart" }));
            }



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
            const clock = entity.getMutableComponent(Clock)!;
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
        const clock = this.queries.clock.results[0].getComponent(Clock)!;
        this.queries.timeToggles.results.forEach(entity => {
            const timeEntity = entity.getMutableComponent(TimeToggle)!;
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
        this.queries.finishedVotes.added!.forEach(entity => {
            const voteAction = entity.getComponent(VoteAction)!;
            const finalVotes: Map<number, number> = new Map();
            voteAction.votes.forEach(voteOption => finalVotes.set(voteOption, 0));

            this.queries.pendingVoteOptions.results.forEach(pendingVote => {
                const option = pendingVote.getComponent(PendingVoteOption)!;
                if (option.actionId === voteAction.id) {

                    finalVotes.set(option.voteOptionId, finalVotes.get(option.voteOptionId)! + 1);

                    pendingVote.remove();
                }
            });

            const max = Math.max(...finalVotes.values());
            const winners = [...finalVotes].filter(([id, count]: [number, number]) => count === max);
            const winner = winners[Math.floor(Math.random() * winners.length)][0];
            entity.removeComponent(VoteAction);
            entity.addComponent(ChosenVoteOption, { id: winner });
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
            const depTrigger = entity.getMutableComponent(DependenciesTrigger)!;
            const chosenvoteOptions = new Set(this.queries.chosenVoteOptions.results.map(e => e.getComponent(ChosenVoteOption)!.id));
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
        clock: {
            components: [Clock]
        }
    }

    execute(delta: number, time: number): void {
        const clock = this.queries.clock.results[0].getComponent(Clock)!;
        this.queries.eventTriggers.added!.forEach(entity => {
            const eventTrigger = entity.getComponent(EventTrigger)!;
            const timeToggle = entity.getMutableComponent(TimeToggle)!;
            const eventData = eventStore.events[eventTrigger.eventId];

            const on = timeToggle.on + eventData.delay;
            const off = timeToggle.on + eventData.delay + eventData.duration;

            this.world.createEntity()
                .addComponent(RenderableEvent, {
                    id: eventData.id,
                    name: eventData.name,
                    delay: eventData.delay,
                    duration: eventData.duration
                })
                .addComponent(TimeToggle, { on, off });

            eventData.triggers.forEach(t => {
                const triggerData = eventStore.events[t];
                this.world.createEntity()
                    .addComponent(EventTrigger, { eventId: t })
                    .addComponent(DependenciesTrigger, { dependencies: triggerData.dependencies.map(vo => vo.id) })
                    .addComponent(TimeToggle, { on: off, off: off + 1000 })
            })
        });
    }
}

export class EventRendererSystem extends System {
    static queries = {
        renderer: {
            components: [Renderer]
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
        clock: {
            components: [Clock]
        }
    }
    execute(delta: number, time: number): void {
        const clock = this.queries.clock.results[0].getComponent(Clock)!;
        const events = this.queries.renderer.results[0].getMutableComponent(Renderer)!.events
        this.queries.pendingEvents.results!.forEach(entity => {
            const renderableEvent: RenderableEvent = entity.getComponent<RenderableEvent>(RenderableEvent)!;
            createOrUpdateEventState(events, "pending", renderableEvent);
        });


        this.queries.activeEvents.results!.forEach(entity => {
            const renderableEvent: RenderableEvent = entity.getComponent<RenderableEvent>(RenderableEvent)!;
            createOrUpdateEventState(events, "active", renderableEvent);
        });

        this.queries.activeEvents.added!.forEach(entity => {
            const timeToggle = entity.getComponent(TimeToggle)!;
            const renderableEvent = entity.getComponent<RenderableEvent>(RenderableEvent)!;
            const eventData = eventStore.events[renderableEvent.id];

            eventData.actions.forEach(a => {
                const actionData = actionStore.actionsDict[a.id];
                const entity = this.world.createEntity();

                actionData.type === "vote"
                    ? entity
                        .addComponent(RenderableVoteAction, Object.assign({}, actionData, {
                            eventId: eventData.id,
                            type: "vote" as "vote",
                            voteOptions: (actionData as Action<"vote">).voteOptions!.map(vo => voteOptionStore.voteOptions[vo.id])
                        }))
                        .addComponent(TimeToggle, { on: timeToggle.on, off: timeToggle.off })
                        .addComponent(VoteAction, { id: actionData.id, votes: (actionData as Action<"vote">).voteOptions.map(vo => vo.id) })
                    : entity
                        .addComponent(RenderableFileAction, Object.assign({}, actionData, { eventId: eventData.id, type: "video" as "video" }))
                        .addComponent(TimeToggle, { on: timeToggle.on, off: timeToggle.off })

            });
        })

        this.queries.finishedEvents.results!.forEach(entity => {
            const renderableEvent: RenderableEvent = entity.getComponent<RenderableEvent>(RenderableEvent)!;
            createOrUpdateEventState(events, "finished", renderableEvent);
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
        renderer: {
            components: [Renderer]
        }
    }

    execute(delta: number, time: number): void {
        const renderer = this.queries.renderer.results[0].getComponent(Renderer)!;

        this.queries.voteActions.added!.forEach(entity => {
            const renderableAction: RenderableVoteAction = entity.getComponent<RenderableVoteAction>(RenderableVoteAction)!;
            renderer.actions.push(renderableAction);
            if (renderer.socket) {
                sendToTD(renderer.socket, renderableAction.eventId, true, renderableAction);
            }
        });

        this.queries.fileActions.added!.forEach(entity => {
            const renderableAction: RenderableFileAction = entity.getComponent<RenderableFileAction>(RenderableFileAction)!;
            renderer.actions.push(renderableAction);
            if (renderer.socket) {
                sendToTD(renderer.socket, renderableAction.eventId, true, renderableAction);
            }
        });

        this.queries.voteActions.removed!.forEach(entity => {
            const renderableAction: RenderableVoteAction =
                entity.hasRemovedComponent(RenderableVoteAction)
                    ? entity.getRemovedComponent<RenderableVoteAction>(RenderableVoteAction)!
                    : entity.getComponent<RenderableVoteAction>(RenderableVoteAction)!;
            renderer.actions.splice(renderer.actions.findIndex(a => a.id === renderableAction.id), 1);
            if (renderer.socket) {
                sendToTD(renderer.socket, renderableAction.eventId, false, renderableAction);
            }
        });

        this.queries.fileActions.removed!.forEach(entity => {
            const renderableAction: RenderableFileAction =
                entity.hasRemovedComponent(RenderableFileAction)
                    ? entity.getRemovedComponent<RenderableFileAction>(RenderableFileAction)!
                    : entity.getComponent<RenderableFileAction>(RenderableFileAction)!;
            renderer.actions.splice(renderer.actions.findIndex(a => a.id === renderableAction.id), 1);
            if (renderer.socket) {
                sendToTD(renderer.socket, renderableAction.eventId, false, renderableAction);
            }
        });
    }
}
// Send an action to TD
const sendToTD: (socket: Socket, actionEventId: number, active: boolean, action: Action<ActionType>) => void =
    (socket, actionEventId, active, action) =>
        socket.send(JSON.stringify({
            eventId: actionEventId,
            actionId: action.id,
            action: action.type,
            zone: action.zone,
            location: action.location,
            active: active,
            filePath: isNotVoteAction(action) ? action.filePath : undefined,
            voteOptions: isVoteAction(action) ? action.voteOptions : undefined,
        }));



const createOrUpdateEventState = (
    events: EventRenderData[], state: "pending" | "active" | "finished",
    renderableEvent: RenderableEvent
) => {
    const event = events.find(e => e.id === renderableEvent.id);
    if (event) {
        event.state = state;
    } else {
        events.push({
            id: renderableEvent.id,
            name: renderableEvent.name,
            delay: renderableEvent.delay,
            duration: renderableEvent.duration,
            state: state
        });
    }
}
