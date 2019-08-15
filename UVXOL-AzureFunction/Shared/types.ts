// TODO: create types that make sense for the app

export type EventId = string

export interface ActionEvent {
    id: string,
    triggers: EventId[],
    delay: number,
    duration: number,
    action: Action,
    dependencies: VoteDependency[]
} 

export interface VoteDependency {
    voteId: VoteId,
    option: string,
}

export type ActionId = string  | VoteId
export type Action = VideoClip | AudioClip | Vote
export type Location = "film" | "overlay" | "house-1" | "house-2"

export interface VideoClip {
    id: ActionId,
    type: "videoclip",
    file: string
    location: Location
}

export interface AudioClip {
    id: ActionId,
    type: "audioclip",
    file: string
}

export type VoteId = string

export interface Vote {
    id: VoteId,
    type: "vote",
    options: VoteOption[]
}

export type VotePosition = "1" | "2" | "3" | "random"

export interface VoteOption {
    id: string,
    name: string,
    position: VotePosition
}

export interface VoteResult {
    id: VoteId,
    result: VoteOption
}
