type ArrayType<A> = A extends Array<infer U> ? U : never;
type ActionArrayType = ArrayType<number>;
type Hmm = Array<Action> extends Array<any> ? "haha" : never;
type RequireId<T> =
    Exclude<{ [K in keyof T]:
        ArrayType<T[K]> extends never
        ? never
        : K
    }[keyof T], undefined>;

export type ServerType<T> = Omit<T, RequireId<T>> & { [K in RequireId<T>]: number[] | Extract<T[RequireId<T>], undefined> };
export type ServerAction<T extends Action | EditableAction> =
    Omit<ServerType<T>, "type"> & { type: number };

export type ActionId = number;

export type Action = { id: ActionId } & EditableAction;

export type EditableAction = {
    type: string;
    name: string;
    location: string;
    filePath?: string;
    voteOptions?: VoteOption[];
    text?: string;
}

export function isServerAction(a: ServerType<EditableAction> | ServerType<Action>): a is ServerType<Action> {
    return (a as Action).id !== undefined;
}

export const ActionTypesMap: { [type: string]: number } = { audio: 0, video: 1, vote: 2 };
export const TypesActionMap: { [type: number]: string } = { 0: 'audio', 1: 'video', 2: 'vote' };

export type EventId = number;

export interface ActionEvent {
    id: EventId;
    name: string;
    duration: number;
    delay?: number | null;
    dependencies: VoteOption[];
    preventions: VoteOption[];
    actions: Action[];
    triggers: EventId[];
}

export type VoteOptionId = number;

export interface VoteOption {
    id: VoteOptionId;
    name: string;
    text?: string | null;
    preventions: VoteOptionId[];
    dependencies: VoteOptionId[];
}

export interface Response {
    message: string;
}
