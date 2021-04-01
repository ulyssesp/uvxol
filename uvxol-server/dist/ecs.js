"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionRendererSystem = exports.EventRendererSystem = exports.EventTriggerSystem = exports.DependenciesTriggerSystem = exports.TallyVotes = exports.TimeToggleSystem = exports.TickClock = exports.Reset = exports.Finished = exports.Pending = exports.Active = exports.ResetComponent = exports.Meter = exports.Run = exports.RenderableMeterAction = exports.RenderableFileAction = exports.RenderableVoteAction = exports.RenderableEvent = exports.EventTrigger = exports.DependenciesSatisfied = exports.DependenciesTrigger = exports.VoteAction = exports.PendingVoteOption = exports.ChosenVoteOption = exports.TimeToggle = exports.Clock = exports.VoteOptionStore = exports.ActionStore = exports.ActionEventStore = exports.Store = void 0;
const ecsy_1 = require("ecsy");
const types_1 = require("./types");
class Store extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.data = new Map();
    }
}
exports.Store = Store;
Store.schema = {
    data: { type: ecsy_1.Types.Ref }
};
class ActionEventStore extends Store {
}
exports.ActionEventStore = ActionEventStore;
;
class ActionStore extends Store {
}
exports.ActionStore = ActionStore;
;
class VoteOptionStore extends Store {
}
exports.VoteOptionStore = VoteOptionStore;
;
class Clock extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.time = 0;
        this.timeScale = 1;
    }
}
exports.Clock = Clock;
class TimeToggle extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.on = 0;
        this.off = 0;
    }
}
exports.TimeToggle = TimeToggle;
TimeToggle.schema = {
    off: { type: ecsy_1.Types.Number },
    on: { type: ecsy_1.Types.Number },
};
;
class ChosenVoteOption extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.id = 0;
        this.name = "";
    }
}
exports.ChosenVoteOption = ChosenVoteOption;
ChosenVoteOption.schema = {
    id: { type: ecsy_1.Types.Number },
    name: { type: ecsy_1.Types.String }
};
class PendingVoteOption extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.voter = "";
        this.actionId = -1;
        this.voteOptionId = -1;
    }
}
exports.PendingVoteOption = PendingVoteOption;
PendingVoteOption.schema = {
    voter: { type: ecsy_1.Types.String },
    actionId: { type: ecsy_1.Types.Number },
    voteOptionId: { type: ecsy_1.Types.Number }
};
class VoteAction extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.id = -1;
        this.votes = [];
    }
}
exports.VoteAction = VoteAction;
VoteAction.schema = {
    id: { type: ecsy_1.Types.Number },
    votes: { type: ecsy_1.Types.Number }
};
class DependenciesTrigger extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.dependencies = [];
    }
}
exports.DependenciesTrigger = DependenciesTrigger;
DependenciesTrigger.schema = {
    dependencies: { type: ecsy_1.Types.Array },
};
class DependenciesSatisfied extends ecsy_1.TagComponent {
}
exports.DependenciesSatisfied = DependenciesSatisfied;
;
class EventTrigger extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.eventId = -1;
        this.triggerId = -1;
    }
}
exports.EventTrigger = EventTrigger;
EventTrigger.schema = {
    eventId: { type: ecsy_1.Types.Number },
    triggerId: { type: ecsy_1.Types.Number },
};
class RenderableEvent extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.id = -1;
        this.name = "";
        this.start = 0;
        this.end = 0;
        this.eventId = -1;
        this.triggerId = -1;
    }
}
exports.RenderableEvent = RenderableEvent;
RenderableEvent.schema = {
    id: { type: ecsy_1.Types.Number },
    name: { type: ecsy_1.Types.String },
    start: { type: ecsy_1.Types.Number },
    end: { type: ecsy_1.Types.Number },
    triggerId: { type: ecsy_1.Types.Number },
};
class RenderableVoteAction extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.id = -1;
        this.eventId = -1;
        this.name = "";
        this.zone = "";
        this.location = "";
        this.voteOptions = [];
        this.text = "";
        this.type = "vote";
    }
}
exports.RenderableVoteAction = RenderableVoteAction;
RenderableVoteAction.schema = {
    id: { type: ecsy_1.Types.Number },
    name: { type: ecsy_1.Types.String },
    zone: { type: ecsy_1.Types.String },
    location: { type: ecsy_1.Types.String },
    voteOptions: { type: ecsy_1.Types.Array },
    text: { type: ecsy_1.Types.String },
    type: { type: ecsy_1.Types.String },
    eventId: { type: ecsy_1.Types.Number }
};
class RenderableFileAction extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.id = -1;
        this.eventId = -1;
        this.name = "";
        this.zone = "";
        this.location = "";
        this.filePath = "";
        this.type = "video";
    }
}
exports.RenderableFileAction = RenderableFileAction;
RenderableFileAction.schema = {
    id: { type: ecsy_1.Types.Number },
    name: { type: ecsy_1.Types.String },
    zone: { type: ecsy_1.Types.String },
    location: { type: ecsy_1.Types.String },
    filePath: { type: ecsy_1.Types.String },
    type: { type: ecsy_1.Types.String },
    eventId: { type: ecsy_1.Types.Number }
};
class RenderableMeterAction extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.id = -1;
        this.eventId = -1;
        this.name = "";
        this.zone = "";
        this.location = "";
        this.type = "meter";
        this.meterType = "fun";
        this.value = 0;
    }
}
exports.RenderableMeterAction = RenderableMeterAction;
RenderableMeterAction.schema = {
    id: { type: ecsy_1.Types.Number },
    name: { type: ecsy_1.Types.String },
    zone: { type: ecsy_1.Types.String },
    location: { type: ecsy_1.Types.String },
    type: { type: ecsy_1.Types.String },
    eventId: { type: ecsy_1.Types.Number },
    meterType: { type: ecsy_1.Types.String },
    value: { type: ecsy_1.Types.Number },
};
function isRenderableVoteAction(a) {
    return a.type === "vote";
}
function isRenderableFileAction(a) {
    return a.type !== "vote";
}
class Run extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.events = [];
        this.actions = [];
    }
}
exports.Run = Run;
Run.schema = {
    events: { type: ecsy_1.Types.Ref },
    actions: { type: ecsy_1.Types.Ref },
    runner: { type: ecsy_1.Types.Ref }
};
class Meter extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.fun = 0;
        this.budget = 0;
    }
}
exports.Meter = Meter;
Meter.schema = {
    fun: { type: ecsy_1.Types.Number },
    budget: { type: ecsy_1.Types.Number }
};
class ResetComponent extends ecsy_1.Component {
    constructor() {
        super(...arguments);
        this.events = [];
    }
}
exports.ResetComponent = ResetComponent;
ResetComponent.schema = {
    events: { type: ecsy_1.Types.Array }
};
;
class Active extends ecsy_1.TagComponent {
}
exports.Active = Active;
;
class Pending extends ecsy_1.TagComponent {
}
exports.Pending = Pending;
;
class Finished extends ecsy_1.TagComponent {
}
exports.Finished = Finished;
;
//////////////////////
// Systems
class Reset extends ecsy_1.System {
    execute(delta, time) {
        if (this.queries.reset.added.length > 0) {
            removeEntities(this.queries.chosenVoteOptions.results);
            removeEntities(this.queries.eventTriggers.results);
            removeEntities(this.queries.renderableEvents.results);
            removeEntities(this.queries.renderableVoteActions.results);
            removeEntities(this.queries.renderableFileActions.results);
            this.queries.clock.results[0].getMutableComponent(Clock).time = 0;
            const renderer = this.queries.renderer.results[0].getMutableComponent(Run);
            renderer.events.splice(0, renderer.events.length);
            if (renderer.runner) {
                renderer.runner.restart();
            }
            const eventStore = this.queries.eventStore.results[0].getComponent(ActionEventStore);
            const actionStore = this.queries.eventStore.results[0].getComponent(ActionStore);
            const voteOptionStore = this.queries.voteOptionStore.results[0].getComponent(VoteOptionStore);
            this.queries.reset.added[0].getComponent(ResetComponent).events.forEach(e => {
                const event = eventStore === null || eventStore === void 0 ? void 0 : eventStore.data.get(e);
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
                });
            });
            this.queries.reset.added[0].remove();
        }
    }
}
exports.Reset = Reset;
Reset.queries = {
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
};
const removeEntities = (entities) => {
    for (let i = entities.length - 1; i >= 0; i--) {
        entities[i].remove();
    }
};
class TickClock extends ecsy_1.System {
    execute(delta, time) {
        this.queries.timeActivations.results.forEach(entity => {
            const clock = entity.getMutableComponent(Clock);
            clock.time += delta * clock.timeScale;
        });
    }
}
exports.TickClock = TickClock;
TickClock.queries = {
    timeActivations: {
        components: [Clock]
    }
};
class TimeToggleSystem extends ecsy_1.System {
    execute(delta, time) {
        const clock = this.queries.clock.results[0].getComponent(Clock);
        this.queries.timeToggles.results.forEach(entity => {
            const timeEntity = entity.getMutableComponent(TimeToggle);
            if (clock.time < timeEntity.on && !entity.hasComponent(Pending)) {
                entity.removeComponent(Active);
                entity.removeComponent(Finished);
                entity.addComponent(Pending);
            }
            else if (clock.time > timeEntity.off && !entity.hasComponent(Finished)) {
                entity.removeComponent(Pending);
                entity.removeComponent(Active);
                entity.addComponent(Finished);
            }
            if (clock.time >= timeEntity.on && clock.time <= timeEntity.off && !entity.hasComponent(Active)) {
                entity.removeComponent(Pending);
                entity.removeComponent(Finished);
                entity.addComponent(Active);
            }
        });
    }
}
exports.TimeToggleSystem = TimeToggleSystem;
TimeToggleSystem.queries = {
    timeToggles: {
        components: [TimeToggle]
    },
    clock: {
        components: [Clock]
    }
};
class TallyVotes extends ecsy_1.System {
    execute(delta, time) {
        if (!this.queries.finishedVotes.added) {
            return;
        }
        this.queries.finishedVotes.added.forEach(entity => {
            const voteAction = entity.getComponent(VoteAction);
            const finalVotes = new Map();
            voteAction.votes.forEach(voteOption => finalVotes.set(voteOption, 0));
            const countedVoters = new Set();
            this.queries.pendingVoteOptions.results.forEach(pendingVote => {
                const option = pendingVote.getComponent(PendingVoteOption);
                if (option.actionId === voteAction.id && !countedVoters.has(option.voter)) {
                    if (option.voter != "control") {
                        countedVoters.add(option.voter);
                    }
                    finalVotes.set(option.voteOptionId, finalVotes.get(option.voteOptionId) + 1);
                    pendingVote.remove();
                }
            });
            const max = Math.max(...finalVotes.values());
            const winners = [...finalVotes].filter(([id, count]) => count === max);
            if (winners.length > 0) {
                const winner = winners[Math.floor(Math.random() * winners.length)][0];
                entity.addComponent(ChosenVoteOption, { id: winner });
            }
            entity.removeComponent(VoteAction);
        });
    }
}
exports.TallyVotes = TallyVotes;
TallyVotes.queries = {
    pendingVoteOptions: {
        components: [PendingVoteOption]
    },
    finishedVotes: {
        components: [VoteAction, Finished],
        listen: { added: true }
    }
};
class DependenciesTriggerSystem extends ecsy_1.System {
    execute(delta, time) {
        this.queries.dependents.results.forEach(entity => {
            const depTrigger = entity.getMutableComponent(DependenciesTrigger);
            const chosenvoteOptions = new Set(this.queries.chosenVoteOptions.results.map(e => e.getComponent(ChosenVoteOption).id));
            const hasDependencies = depTrigger.dependencies.every(d => chosenvoteOptions.has(d));
            if (hasDependencies && !entity.hasComponent(DependenciesSatisfied)) {
                entity.addComponent(DependenciesSatisfied);
            }
            else if (!hasDependencies && entity.hasComponent(DependenciesSatisfied)) {
                entity.removeComponent(DependenciesSatisfied);
            }
        });
    }
}
exports.DependenciesTriggerSystem = DependenciesTriggerSystem;
DependenciesTriggerSystem.queries = {
    dependents: {
        components: [DependenciesTrigger, Active],
    },
    chosenVoteOptions: {
        components: [ChosenVoteOption]
    }
};
class EventTriggerSystem extends ecsy_1.System {
    execute(delta, time) {
        const eventStore = this.queries.eventStore.results[0].getComponent(ActionEventStore).data;
        const actionStore = this.queries.actionStore.results[0].getComponent(ActionStore).data;
        const voteOptionStore = this.queries.actionStore.results[0].getComponent(VoteOptionStore).data;
        const chosenVoteOptions = new Set(this.queries.chosenVoteOptions.results.map(cvo => cvo.getComponent(ChosenVoteOption).id));
        this.queries.eventTriggers.added.forEach(entity => {
            const eventTrigger = entity.getComponent(EventTrigger);
            const timeToggle = entity.getMutableComponent(TimeToggle);
            const eventData = eventStore.get(eventTrigger.eventId);
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
                const actionData = actionStore.get(a.id);
                const entity = this.world.createEntity();
                const baseRenderableAction = {
                    id: actionData.id,
                    eventId: eventData.id,
                    name: actionData.name,
                    zone: actionData.zone,
                    location: actionData.location,
                };
                if (actionData.type === "vote") {
                    const meter = this.queries.meter.results[0].getComponent(Meter);
                    const voteOptions = actionData.voteOptions
                        .map(vo => voteOptionStore.get(vo.id))
                        .filter(vo => (vo.funRequirement === undefined || vo.funRequirement < meter.fun) &&
                        (vo.budgetRequirement === undefined || vo.budgetRequirement < meter.budget) &&
                        vo.dependencies.every(dep => chosenVoteOptions.has(dep)) &&
                        vo.preventions.every(prev => !chosenVoteOptions.has(prev)));
                    entity
                        .addComponent(RenderableVoteAction, Object.assign(baseRenderableAction, {
                        eventId: eventData.id,
                        type: "vote",
                        voteOptions,
                    }))
                        .addComponent(TimeToggle, { on: on, off: off })
                        .addComponent(VoteAction, {
                        id: actionData.id,
                        votes: voteOptions.map(vo => vo.id)
                    });
                }
                else if (actionData.type === "video") {
                    const tags = types_1.actionVoteOptions(actionData)
                        .filter(vo => chosenVoteOptions.has(vo.id))
                        .map(vo => vo.shortname);
                    const filePath = actionData.filePath;
                    const extIndex = filePath.indexOf('.');
                    entity
                        .addComponent(RenderableFileAction, Object.assign(baseRenderableAction, {
                        eventId: eventData.id,
                        type: "video",
                        filePath: filePath.substring(0, extIndex >= 0 ? extIndex : filePath.length) +
                            (tags.length > 0 ? "-" : "") +
                            tags.join('-') +
                            ".mp4"
                    }))
                        .addComponent(TimeToggle, { on: on, off: off });
                }
                else if (types_1.isMeterAction(actionData)) {
                    const meterType = actionData.funMeterValue !== undefined ? "fun"
                        : actionData.budgetMeterValue !== undefined ? "budget"
                            : undefined;
                    entity
                        .addComponent(RenderableMeterAction, Object.assign(baseRenderableAction, {
                        eventId: eventData.id,
                        type: "meter",
                        value: meterType === "fun" ? actionData.funMeterValue : actionData.budgetMeterValue,
                        meterType
                    }))
                        .addComponent(TimeToggle, { on: on, off: Number.MAX_VALUE });
                }
            });
            eventData.triggers.forEach(t => {
                const triggerData = eventStore.get(t);
                this.world.createEntity()
                    .addComponent(EventTrigger, { eventId: t, triggerId: eventData.id })
                    .addComponent(DependenciesTrigger, { dependencies: triggerData.dependencies.map(vo => vo.id) })
                    .addComponent(TimeToggle, { on: off, off: off + 1000 });
            });
            entity.remove();
        });
    }
}
exports.EventTriggerSystem = EventTriggerSystem;
EventTriggerSystem.queries = {
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
};
class EventRendererSystem extends ecsy_1.System {
    execute(delta, time) {
        const eventStore = this.queries.eventStore.results[0].getComponent(ActionEventStore).data;
        const renderer = this.queries.renderer.results[0].getComponent(Run);
        const events = this.queries.renderer.results[0].getMutableComponent(Run).events;
        this.queries.pendingEvents.added.forEach(entity => {
            const renderableEvent = entity.getComponent(RenderableEvent);
            const event = createOrUpdateEventState(events, "pending", renderableEvent);
            renderer.runner.addEvent(event);
        });
        this.queries.activeEvents.added.forEach(entity => {
            const renderableEvent = entity.getComponent(RenderableEvent);
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
        this.queries.finishedEvents.added.forEach(entity => {
            const renderableEvent = entity.getComponent(RenderableEvent);
            const event = createOrUpdateEventState(events, "finished", renderableEvent);
            renderer.runner.addEvent(event);
        });
    }
}
exports.EventRendererSystem = EventRendererSystem;
EventRendererSystem.queries = {
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
};
class ActionRendererSystem extends ecsy_1.System {
    execute(delta, time) {
        const renderer = this.queries.renderer.results[0].getComponent(Run);
        const meter = this.queries.meter.results[0].getMutableComponent(Meter);
        this.queries.voteActions.added.forEach(entity => {
            const renderableAction = entity.getComponent(RenderableVoteAction);
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
                })));
            }
        });
        this.queries.fileActions.added.forEach(entity => {
            const renderableAction = entity.getComponent(RenderableFileAction);
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
        this.queries.meterActions.added.forEach(entity => {
            console.log("Adding meter");
            const renderableAction = entity.getComponent(RenderableMeterAction);
            if (renderableAction.meterType === "fun") {
                meter.fun += renderableAction.value;
            }
            else if (renderableAction.meterType === "budget") {
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
        this.queries.voteActions.removed.forEach(entity => {
            const renderableAction = entity.hasRemovedComponent(RenderableVoteAction)
                ? entity.getRemovedComponent(RenderableVoteAction)
                : entity.getComponent(RenderableVoteAction);
            renderer.actions.splice(renderer.actions.findIndex(a => a.id === renderableAction.id), 1);
            if (renderer.runner) {
                renderer.runner.removeAction(renderableAction);
            }
        });
        this.queries.fileActions.removed.forEach(entity => {
            const renderableAction = entity.hasRemovedComponent(RenderableFileAction)
                ? entity.getRemovedComponent(RenderableFileAction)
                : entity.getComponent(RenderableFileAction);
            renderer.actions.splice(renderer.actions.findIndex(a => a.id === renderableAction.id), 1);
            if (renderer.runner) {
                renderer.runner.removeAction(renderableAction);
            }
        });
        this.queries.meterActions.removed.forEach(entity => {
            const renderableAction = entity.hasRemovedComponent(RenderableMeterAction)
                ? entity.getRemovedComponent(RenderableMeterAction)
                : entity.getComponent(RenderableMeterAction);
            if (renderableAction.meterType === "fun") {
                meter.fun -= renderableAction.value;
            }
            else if (renderableAction.meterType === "budget") {
                meter.budget -= renderableAction.value;
            }
        });
    }
}
exports.ActionRendererSystem = ActionRendererSystem;
ActionRendererSystem.queries = {
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
};
const createOrUpdateEventState = (events, state, renderableEvent) => {
    let event = events.find(e => e.id === renderableEvent.id);
    if (event) {
        event.state = state;
    }
    else {
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
};
