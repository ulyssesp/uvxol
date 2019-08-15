import { ActionEvent } from "./types";

// TODO: Mock data for testing without connection and methods for retrieving.

export const events : ActionEvent[] = [
    {
        id: "show-start",
        triggers: [],
        delay: 0,
        duration: 45,
        action: {id: "show-start", type: "videoclip", file: "test.mp4", location: "film"},
        dependencies: []
    },
    {
        id: "show-start-vote",
        triggers: [],
        delay: 0,
        duration: 15,
        action: {
            id: "show-start", 
            type: "vote", 
            options: [
                {id: "bubbles", name: "Bubbles", position: "1"}, 
                {id: "jokes", name: "Jokes", position: "2"}
            ]
        },
        dependencies: []
    },
    {
        id: "bubbles",
        triggers: ["show-start-vote"],
        delay: 0,
        duration: 30,
        action: {
            id: "bubbles-vid", 
            type: "videoclip", 
            file: "bubbles.mp4",
            location: "film"
        },
        dependencies: [{voteId: "show-start", option: "bubbles"}]
    },
]