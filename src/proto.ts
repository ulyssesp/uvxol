import "fp-ts"
import { getMonoid, foldRight } from "fp-ts/lib/Array";
import { monoidAll, fold } from "fp-ts/lib/Monoid";
import { array, record, option, task } from "fp-ts";
import { flow } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import * as readline from 'readline'
import { eqString } from "fp-ts/lib/Eq";

interface Vote {
    id: string,
    options: [VoteOption]
}

interface VoteOption {
    id: string,
    dependson: [string, string]
}

type VoteResults = Record<string, string>

type Category = "film" | "stage" | "house-1" | "house-2" | "house-3"
type ContentType = "vote" | "file"

interface Content {
    type: ContentType,
    triggerId: string,
    waitfor: string[],
    dependson: [string, string][],
    duration: number
}


var content : Content[] = [
     {
         duration: 100.0, 
         dependson:[], 
         triggerId:"top-of-show-stage", 
         waitfor:[], type: "file"}, 
         {duration:100.0, dependson:[], triggerId:"calibration-stage", waitfor:["top-of-show-stage"], type: "file"}, 
         {duration:5000.0, dependson:[], triggerId:"calibration-vote", waitfor:["calibration-stage"], type: "vote"}, 
         {duration:100, dependson:[], triggerId:"post-house-ambient", waitfor:["calibration-vote"], type: "file"}, 
         {duration:5000, dependson:[], triggerId:"post-house-vote", waitfor:["calibration-vote"], type: "vote"}, 
         {duration:100.0, dependson:[["calibration-vote", "food"]], triggerId:"stage-vote-food", waitfor:["calibration-vote"], type: "file"}, 
         {duration:60.0, dependson:[["calibration-vote", "drink"]], triggerId:"stage-vote-drink", waitfor:["calibration-vote"], type: "file"}, 
         {duration:100.0, dependson:[], triggerId:"film-vote-trigger", waitfor:["stage-vote-food"], type: "file"}, 
         {duration:100.0, dependson:[], triggerId:"film-vote-trigger", waitfor:["stage-vote-drink"], type: "file"}
]

var state: VoteResults = {}

function run(content: Content) {
    const isActive = 
        pipe(
            content.dependson,
            array.map(dependson => pipe(
                record.lookup(dependson[0], state),
                option.map(r => r === dependson[1]),
                option.getOrElse(() => false)
            )),
            fold(monoidAll)
        )

    if(isActive) {
        console.log("Running: " + content.triggerId)
        var to = setTimeout(() => finishContent(content.triggerId), content.duration)
        if(content.type === "vote") {
            console.log("vote on " + content.triggerId)
            getStrLn().then(result => {
                state = record.insertAt(content.triggerId, result)(state)
                finishContent(content.triggerId)
                clearTimeout(to)
            })
        }
        
    }
}

function finishContent(triggerId: string) {
    pipe(
        content,
        array.filter(c => array.elem(eqString)(triggerId, c.waitfor)),
        array.map(run)
    )
}

const getStrLn: task.Task<string> = () =>
  new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('> ', answer => {
      rl.close()
      resolve(answer)
    })
  })

run(content[0])