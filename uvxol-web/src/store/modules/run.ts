import Vue from 'vue';
import { Module, VuexModule, Action, Mutation, MutationAction, getModule } from 'vuex-module-decorators';
import { ActionEvent, EventId, VoteOption, VoteOptionId, ActionId } from '@/types';
import * as ty from '@/types';
import store from '@/store';
import eventStore from './events';
import voteOptionStore from './voteoptions';
import { task, array, set, eq, option, semigroup, ord, nonEmptyArray, tuple } from 'fp-ts';
import { flow, constVoid, constant, identity, flip } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/lib/pipeable';
import { logid, logval } from '../../utils/fp-utils';
import * as idt from 'fp-ts/lib/Identity';
import * as cnst from 'fp-ts/lib/Const';
import * as trv from 'fp-ts/lib/Traversable';
import * as fld from 'fp-ts/lib/Foldable';
import * as ap from 'fp-ts/lib/Applicative';
import * as tup from 'fp-ts/lib/Tuple';
import * as m from 'fp-ts/lib/Monoid';
import * as mo from 'fp-ts/lib/Monad';
import * as rand from 'fp-ts/lib/Random';
import * as f from 'fp-ts/lib/Functor';
import * as ot from 'fp-ts/lib/OptionT';
import * as chn from 'fp-ts/lib/Chain';
import { getFilterableComposition } from 'fp-ts/lib/Filterable';
import Socket from './socket';
import { eqNumber } from 'fp-ts/lib/Eq';
import { foldLeft } from 'fp-ts/lib/ReadonlyArray';
import { taskSeq } from 'fp-ts/lib/Task';
import { IORef } from 'fp-ts/lib/IORef';
import { io } from 'fp-ts/lib/IO';

const eqActionEvent = eq.eq.contramap(eq.eqNumber, (e: ActionEvent) => e.id);
const eqViewEvent = eq.eq.contramap(eq.eqNumber, (e: ty.ViewEvent) => e.id);
const seqT = array.array.sequence(task.task);
const seqTSeq = array.array.sequence(task.taskSeq);
const tseq: <A>(ta: task.Task<A>[]) => task.Task<void> =
  ta => fld.traverse_(task.taskSeq, array.array)(ta, task.map(constVoid))
const tparallel_: <A>(ta: task.Task<A>[]) => task.Task<void> =
  ta => fld.traverse_(task.task, array.array)(ta, task.map(constVoid))

const checkVoteOptions:
  (chosenVoteOptions: { [id: number]: number }) =>
    (target: boolean) =>
      (checkVoteOptions: VoteOption[]) => boolean[] = chosenVoteOptions => target =>
        array.map((voteOption: VoteOption) => (chosenVoteOptions[voteOption.id] === undefined) === target)

const checkEventShouldRun = (chosenVoteOptions: { [id: number]: number }) => (e: ty.ActionEvent) =>
  pipe(
    array.getMonoid<boolean>().concat(
      // Check if chosenVoteOptions contains dependencies
      checkVoteOptions(chosenVoteOptions)(false)(e.dependencies),
      // Check if chosenVoteOptions doesn't contain preventions
      checkVoteOptions(chosenVoteOptions)(true)(e.preventions)
    ),
    ds => semigroup.fold(semigroup.semigroupAll)(true, ds),
    // Convert `false` to None
    option.fromPredicate(identity),
  )

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    TaskOption: task.Task<option.Option<A>>
  }
}
const taskOption: mo.Monad1<'TaskOption'> = {
  URI: 'TaskOption',
  ...ot.getOptionM(task.task)
}

const actionEventToViewEvent: (e: ty.ActionEvent) => ty.ViewEvent = e =>
  Object.assign(e, {
    active: false,
    actions: e.actions.map(a =>
      // Disable UI elements on start
      Object.assign({ active: false }, a))
  });

// Create a task to be run before event
const eventPrepareTask: (self: Run, e: ty.ActionEvent) => task.Task<ty.ViewEvent> =
  (self, e) => pipe(
    // Push the event into the run list
    task.fromIO(() => actionEventToViewEvent(e)),
    task.chainFirst(e => task.fromIO(() => self.runList.push(e)))
  );

// Create a task to be run after delay, but before duration
// The task's output is a new ViewEvent with everything active
const eventStartTask: (self: Run) => (e: ty.ViewEvent) => task.Task<ty.ViewEvent> =
  self => e => pipe(
    // Run the actions
    e.actions,
    array.map(actionStartTask(self)),
    seqT,
    // Immutably set the view event and its actions to active
    task.map(actions => Object.assign(
      {},
      e,
      { active: true, actions }
    )),
  );

// Create a task to be run after delay, but before duration
// The task's output is the active event
const actionStartTask: (self: Run) => (a: ty.ViewAction<ty.ActionType>) => task.Task<ty.ViewAction<ty.ActionType>> =
  self => a => pipe(
    Object.assign({}, a, { active: true }),
    task.of,
    task.chainFirst(Run.sendToTD(self))
  );

// Create a task to be run after delay, and after duration
const eventEndTask: (self: Run) => (e: ty.ViewEvent) => task.Task<ty.ViewEvent> =
  self => e => {
    e.active = false
    return pipe(
      e.actions.map(actionEndTask(self, e)),
      tparallel_,
      task.chain(() => task.of(e))
    )
  }

// Create a task to be run after delay and duration
const actionEndTask: (self: Run, e: ty.ViewEvent) => (a: ty.ViewAction<ty.ActionType>) => task.Task<void> =
  (self, e) => a => {
    a.active = false
    // Tally the vote
    return ty.isVoteAction(a) ?
      actionEndVote(self, e)(a) : task.fromIO(() => undefined)
  };

const actionEndVote: (self: Run, e: ty.ViewEvent) => (a: ty.ViewAction<"vote">) => task.Task<void> =
  (self, e) => a =>
    pipe(
      // Create a Task<Option<_>> from the pending vote options
      () => Promise.resolve(option.fromNullable(self.pendingVoteOptions[a.id])),
      // Figure out the voteoptionid that won 
      ta => taskOption.chain(ta, flow(
        // Sort the voteoptions
        array.sort(ord.ordNumber),
        // chop into same vote options
        array.chop(as => {
          const { init, rest } = array.spanLeft((a: number) => eq.eqNumber.equals(a, as[0]))(as)
          return [init, rest];
        }),
        // convert array of votes to [vote, count] tuple
        array.map(arr => [arr[0], arr.length] as [number, number]),
        // convert to nonemptyarray
        nonEmptyArray.fromArray,
        // grab the max based on the second tuple element
        option.map(nonEmptyArray.max(ord.ord.contramap(ord.ordNumber, e => e[1]))),
        // grab the voteoption id of the tuple
        option.map(tuple.fst),
        // Create task
        task.of
      )),
      task.chain(option.fold(
        () => pipe(
          a.voteOptions,
          vo => pipe(
            task.fromIO(rand.randomInt(0, vo.length - 1)),
            task.map(n => vo[n].id),
          )
        ),
        n => task.of(n)
      )),
      // Set chosenVoteOptions[winningVoteOptionId] to winningVoteOptionId
      chosen => task.ap(chosen)(task.of((r: number) => { Vue.set(self.chosenVoteOptions, r, r); })),
    )


@Module({ dynamic: true, name: 'runStore', store })
class Run extends VuexModule {

  static startEvents: () => ActionEvent[] = () =>
    eventStore.eventsList.filter(e => eventStore.eventsByTrigger[e.id] == null)

  // Generate all tasks required to run these events.
  static runEvents: (self: Run) => (es: Set<ty.ActionEvent>) => task.Task<void>[] = self =>
    flow(
      // Convert set to array ordering by duration
      set.toArray(ord.ord.contramap(ord.ordNumber, e => e.duration)),
      //  Run al lthe valid events
      array.filterMap(Run.runEvent(self)),
    )

  // Generate a task to run this event. This task includes data fetching, triggering other events, etc.
  static runEvent: (self: Run) => (e: ty.ActionEvent) => option.Option<task.Task<void>> = self =>
    flow(
      // Convert the (possibly null) ActionEvent to an Option
      option.fromNullable,
      // If the event shouldn't be run, return None
      option.chainFirst(checkEventShouldRun(self.chosenVoteOptions)),
      option.map(e => tparallel_([
        // Fetch events for the trigger id
        () => eventStore.getEventsForTrigger(e.id).then(constVoid),
        // Run the events
        pipe(
          eventPrepareTask(self, e),
          // Run start task in parallel to prep task
          task.chainFirst(flow(
            eventStartTask(self),
            task.chainIOK(
              ve => () => {
                self.runList.splice(self.runList.findIndex(re => ve.id === re.id), 1, ve)
              }
            ),
            task.delay(e.delay || 0)
          )),
          // Run end task after start task
          task.chain(flow(
            eventEndTask(self),
            task.chainIOK(ve => () => {
              self.runList.splice(self.runList.findIndex(re => ve.id === re.id), 1, ve)
            }),
            task.delay(e.duration || 0)
          )),
        )
      ])),
    )

  // Send an action to TD
  static sendToTD: (self: Run) => (action: ty.ViewAction<ty.ActionType>) => task.Task<void> =
    self => action => task.fromIO(() =>
      self.socket.send(JSON.stringify({
        zone: action.zone,
        location: action.location,
        active: action.active,
        filePath: ty.isNotVoteAction(action) ? action.filePath : undefined,
        voteOptions: ty.isVoteAction(action) ? action.voteOptions : undefined,
        voteText: ty.isVoteAction(action) ? action.text : undefined
      }))
    );


  // List of events that have run. Used for Debugging purposes.
  public runList: ty.ViewEvent[] = [];
  public chosenVoteOptions: { [id: number]: number } = {};
  public pendingVoteOptions: { [id: number]: Array<number> } = {};
  private socket = new Socket();

  get log() {
    return this.runList;
  }

  @Action({ commit: 'restart', rawError: true })
  public async start() { }

  @Action({ commit: 'addVote', rawError: true })
  public async chooseVote(va: [VoteOptionId, ActionId]) {
    return va;
  }

  @Mutation
  public async restart() {
    return pipe(
      // Reset instance variables
      task.fromIO(() => {
        this.runList = [];
        this.chosenVoteOptions = {}
        this.pendingVoteOptions = {};
      }),
      // fetch the start events
      task.chain(_ => constant(eventStore.getStartEvents())),
      task.chain(_ => task.of(Run.startEvents())),
      task.map(set.fromArray(eqActionEvent)),
      // Run the start events in sequence
      task.chain(flow(Run.runEvents(this), array.array.sequence(task.task)))
    )();
  }

  @Mutation
  public async addVote([v, a]: [VoteOptionId, ActionId]) {
    Vue.set(this.pendingVoteOptions, a, array.cons(v, this.pendingVoteOptions[a] || []));
  }

  @Mutation
  public async reset() {
    this.runList = [];
    this.chosenVoteOptions = {};
    this.pendingVoteOptions = {};
  }
}

export default getModule(Run);
