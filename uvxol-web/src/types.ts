export type ActionId = number;

export interface Action {
    id: ActionId;
    type: number;
    file: string;
    name: string;
    location: string;
}

export const ActionTypesMap: { [type: string]: number } = { audio: 0, video: 1, vote: 2};

export type EventId = number;

export interface ActionEvent {
    id: EventId;
    name: string,
    duration: number;
    delay?: number;
    actions: Action[];
}

