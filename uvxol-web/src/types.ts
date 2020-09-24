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
} & (T extends "vote" ? VoteActionFields : FileActionFields);

type VoteActionFields = {
    voteOptions: VoteOption[];
    text: string;
}

type FileActionFields = {
    filePath: string;
}

export type ViewAction<T extends ActionType> = Action<T> & { active: boolean };
export type ViewEvent = Omit<ActionEvent, "actions"> & { active: boolean, actions: ViewAction<ActionType>[] };

export function isServerAction<T extends ActionType>(a: ServerType<EditableAction<T>> | ServerType<Action<T>>): a is ServerType<Action<T>> {
    return (a as Action<T>).id !== undefined;
}

export function isVoteAction(a: EditableAction<ActionType>): a is EditableAction<"vote"> {
    return a.type === "vote";
}

export function isNotVoteAction(a: EditableAction<ActionType>): a is EditableAction<Exclude<ActionType, "vote">> {
    return a.type !== "vote";
}

export function isVoteEditableAction(a: EditableAction<ActionType>): a is EditableAction<"vote"> {
    return a.type === "vote";
}

export type ActionType = 'audio' | 'video' | 'vote';
export const ActionTypesMap: { [K in ActionType]: number } = { audio: 0, video: 1, vote: 2 };
export const TypesActionMap: { [type: number]: ActionType } = { 0: 'audio', 1: 'video', 2: 'vote' };

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

export interface VoteOption {
    id: VoteOptionId;
    name: string;
    text: string;
    preventions: VoteOption[];
    dependencies: VoteOption[];
}

export type EditableVoteOption = Omit<VoteOption, "id" | "preventions" | "dependencies"> & {
    preventions: number[],
    dependencies: number[]
}

export interface Response {
    message: string;
}
