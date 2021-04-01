type ArrayType<A> = A extends Array<infer U> ? U : never;
type RequireId<T> =
  Exclude<{ [K in keyof T]:
    ArrayType<T[K]> extends never
    ? never
    : K
  }[keyof T], undefined>;

export type ServerType<T> = Omit<T, RequireId<T>> & { [K in RequireId<T>]: number[] | Extract<T[RequireId<T>], undefined> };
export type ServerAction<T extends Action<ActionType> | EditableAction<ActionType>> =
  Omit<ServerType<T>, "type"> & { type: number };

export type ActionId = number;

export type Action<T extends ActionType> = { id: ActionId } & EditableAction<T>;

export type EditableAction<T extends ActionType> = {
  type: T;
  name: string;
  zone: string;
  location: string;
} & (T extends "vote" ? VoteActionFields : T extends 'meter' ? MeterActionFields : FileActionFields);

export type VoteActionFields = {
  voteOptions: VoteOption[];
  text: string;
}

export type FileActionFields = {
  filePath: string;
  voteOptions: VoteOption[];
}

export type MeterActionFields = {
  funMeterValue: number;
  budgetMeterValue: number;
}

export type ViewAction<T extends ActionType> = Action<T> & { active: boolean };
// export type ViewEvent = Omit<ActionEvent, "actions"> & { active: boolean, actions: ViewAction<ActionType>[] };

export type EventRenderData = {
  id: number,
  name: string,
  end: number,
  start: number,
  state: "pending" | "active" | "finished",
  triggerId: number
}

export function isServerAction<T extends ActionType>(a: ServerType<EditableAction<T>> | ServerType<Action<T>>): a is ServerType<Action<T>> {
  return (a as Action<T>).id !== undefined;
}

export function isVoteAction(a: EditableAction<ActionType>): a is EditableAction<"vote"> {
  return a.type === "vote";
}
export function isFileAction(a: EditableAction<ActionType>): a is EditableAction<"audio" | "video"> {
  return a.type === "video" || a.type === "audio";
}

export function actionVoteOptions(val: EditableAction<ActionType>): VoteOption[] {
  return isVoteAction(val) || isFileAction(val) ? val.voteOptions : [];
}

export function isMeterAction(a: EditableAction<ActionType>): a is EditableAction<"meter"> {
  return a.type === "meter";
}

export function isNotVoteAction(a: EditableAction<ActionType>): a is EditableAction<Exclude<ActionType, "vote">> {
  return a.type !== "vote";
}

export function isVoteEditableAction(a: EditableAction<ActionType>): a is EditableAction<"vote"> {
  return a.type === "vote";
}

export type ActionType = 'audio' | 'video' | 'vote' | 'meter';
export const ActionTypesMap: { [K in ActionType]: number } = { audio: 0, video: 1, vote: 2, meter: 3 };
export const TypesActionMap: { [type: number]: ActionType } = { 0: 'audio', 1: 'video', 2: 'vote', 3: 'meter' };

export type ActionRenderData<T extends ActionType> = {
  type: T,
  id: number,
  eventId: number,
  name: string,
  zone: string,
  location: string,
} & (T extends "vote" ? { voteOptions: VoteOption[] } : T extends 'meter' ? { value: number, meterType: "fun" | "budget" } : { filePath: string });

export type EventId = number;

export interface ActionEvent {
  id: EventId;
  name: string;
  duration: number;
  delay: number;
  dependencies: VoteOption[];
  preventions: VoteOption[];
  actions: Action<ActionType>[];
  triggers: EventId[];
}

export type EditableEvent = Omit<ActionEvent, "id" | "actions" | "triggers" | "dependencies" | "preventions"> & {
  actions: number[],
  triggers: number[],
  dependencies: number[],
  preventions: number[]
};

export type VoteOptionId = number;

export type VoteOption = {
  id: VoteOptionId;
  name: string;
  shortname: string;
  text: string;
  funRequirement: number | undefined;
  budgetRequirement: number | undefined;
  preventions: VoteOptionId[];
  dependencies: VoteOptionId[];
}

export type EditableVoteOption = Omit<VoteOption, "id" | "preventions" | "dependencies"> & {
  preventions: number[],
  dependencies: number[]
}

export interface Response {
  message: string;
}

export type ServerEvent =
  {
    type: "setPlaySpeed",
    speed: number
  } | {
    type: "vote",
    voteOptionId: number,
    actionId: number,
    voter: string
  } | {
    type: "overrideVoteOptions",
    voteOptionIds: number[]
  } | {
    type: "restart"
  } | {
    type: "fetchState"
  };

export type Runner = {
  addAction: (action: ActionRenderData<ActionType>) => void,
  addEvent: (event: EventRenderData) => void,
  removeAction: (action: ActionRenderData<ActionType>) => void,
  removeEvent: (id: number) => void,
  restart: () => void,
  setPlaySpeed: (speed: number, time: number) => void
  startVote: (zone: string, voteOptions: { name: string, voteOptionId: number, actionId: number }[]) => void;
}