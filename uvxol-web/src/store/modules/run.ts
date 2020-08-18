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
import * as f from 'fp-ts/lib/Functor';
import * as ot from 'fp-ts/lib/OptionT';
import * as chn from 'fp-ts/lib/Chain';
import { getFilterableComposition } from 'fp-ts/lib/Filterable';
import rp from 'request-promise-native';

const eqActionEvent = eq.eq.contramap(eq.eqNumber, (e: ActionEvent) => e.id);
const seqT = array.array.sequence(task.task);
const seqTSeq = array.array.sequence(task.taskSeq);
const tseq: <A>(ta: task.Task<A>[]) => task.Task<void> =
  ta => fld.traverse_(task.taskSeq, array.array)(ta, task.map(constVoid))
const tparallel: <A>(ta: task.Task<A>[]) => task.Task<void> =
  ta => fld.traverse_(task.task, array.array)(ta, task.map(constVoid))
const checkVoteOptions:
  (chosenVoteOptions: { [id: number]: number }) =>
    (target: boolean) =>
      (checkVoteOptions: VoteOption[]) => boolean[] = chosenVoteOptions => target =>
        array.map((voteOption: VoteOption) => (chosenVoteOptions[voteOption.id] === undefined) === target)

const checkEventShouldRun = (chosenVoteOptions: { [id: number]: number }) => (e: ActionEvent) =>
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

@Module({ dynamic: true, name: 'runStore', store })
class Run extends VuexModule {

  // Generate all tasks required to run these events.
  static runEvents: (self: Run) => (es: Set<ActionEvent>) => task.Task<void>[] = self =>
    flow(
      // Convert set to array ordering by duration
      set.toArray(ord.ord.contramap(ord.ordNumber, e => e.duration)),
      //  Run al lthe valid events
      array.filterMap(Run.runEvent(self)),
    )

  // Generate a task to run this event. This task includes data fetching, triggering other events, etc.
  static runEvent: (self: Run) => (e: ActionEvent) => option.Option<task.Task<void>> = self =>
    flow(
      // Convert the (possibly null) ActionEvent to an Option
      option.fromNullable,
      // If the event shouldn't be run, return None
      option.chainFirst(checkEventShouldRun(self.chosenVoteOptions)),
      option.map(e => tparallel([
        // Fetch events for the trigger id
        () => eventStore.getEventsForTrigger(e.id).then(constVoid),
        // Run the events
        pipe(
          // Push the event into the run list
          task.fromIO(() => { self.runList.push(e); }),
          // Wait out the delay
          task.delay(e.delay || 0),
          // Only return the delay action (?)
          task.apSecond(
            pipe(
              e.actions,
              array.map<ty.Action, task.Task<option.Option<void>>>(a => pipe(
                // Send the location and filepath to the websocket
                task.fromIO(() => Run.sendToTD(self, a.location, a.filePath)),
                // map the result to the action id
                task.map(() => a.id),
                // Create a Task<Option<_>> from the pending vote options
                id => task.ap(id)(task.of(id => option.fromNullable(self.pendingVoteOptions[id]))),
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
                  // grabe the voteoption id of the tuple
                  option.map(tuple.fst),
                  // convert to task (?)
                  task.of
                )),
                // Set chosenVoteOptions[winningVoteOptionId] to winningVoteOptionId
                t => taskOption.ap(taskOption.of(r => { Vue.set(self.chosenVoteOptions, r, r); }), t),
              )),
              tseq,
              task.chain(() =>
                pipe(
                  // Grab the triggered events
                  task.fromIO(() => option.fromNullable(eventStore.eventsByTrigger[e.id])),
                  // If there are none, create an empty set
                  task.map(option.getOrElse(constant(set.empty as Set<number>))),
                  // filter out any events we haven't fetched
                  task.map(set.filterMap(eqActionEvent)(id => option.fromNullable(eventStore.events[id]))),
                  // run the events in sequence
                  task.chain(flow(Run.runEvents(self), tseq)))),
              // Delay for duration
              task.delay(e.duration || 0)
            ))),
      ])),
    )

  static sendToTD: (self: Run, location: string, filePath: string | undefined) => void =
    (self, location, filePath) =>
      rp.get({
        url: "http://localhost:9980",
        qs: {
          location: location,
          filePath: filePath
        }
      });

  // self.socket.send(`["${action.location}", "${action.filePath === undefined ? "" : action.filePath}"]`))

  // List of events that have run. Used for Debugging purposes.
  public runList: ActionEvent[] = [];
  public chosenVoteOptions: { [id: number]: number } = {};
  public pendingVoteOptions: { [id: number]: Array<number> } = {};
  private socket = new WebSocket("ws://localhost:8080");

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
      task.chain(_ => task.of(eventStore.startEvents)),
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
