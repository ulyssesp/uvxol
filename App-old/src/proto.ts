import "fp-ts"
import { getMonoid, foldRight } from "fp-ts/lib/Array";
import { monoidAll, fold } from "fp-ts/lib/Monoid";
import { array, record, option, task } from "fp-ts";
import { flow } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import { eqString } from "fp-ts/lib/Eq";
import { Action } from "../../UVXOL-AzureFunction/Shared/types"
import Vue from "vue"

type VoteResults = Record<string, string>

var state: VoteResults = {}

var actions: Action[] = []


var app = new Vue({
    router: new Router
})


// function run(content: Content) {
//     const isActive = 
//         pipe(
//             showrun.dependson,
//             array.map(dependson => pipe(
//                 record.lookup(dependson[0], state),
//                 option.map(r => r === dependson[1]),
//                 option.getOrElse(() => false)
//             )),
//             fold(monoidAll)
//         )

//     if(isActive) {
//         console.log("Running: " + content.triggerId)
//         var to = setTimeout(() => finishContent(content.triggerId), content.duration)
//         if(content.type === "vote") {
//             console.log("vote on " + content.triggerId)
//             // getStrLn().then(result => {
//             //     state = record.insertAt(content.triggerId, result)(state)
//             //     finishContent(content.triggerId)
//             //     clearTimeout(to)
//             // })
//         }
        
//     }
// }

// function finishContent(triggerId: string) {
//     pipe(
//         showrun.content,
//         array.filter(c => array.elem(eqString)(triggerId, c.waitfor)),
//         array.map(run)
//     )
// }