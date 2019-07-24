"use strict";
exports.__esModule = true;
require("fp-ts");
var Monoid_1 = require("fp-ts/lib/Monoid");
var fp_ts_1 = require("fp-ts");
var pipeable_1 = require("fp-ts/lib/pipeable");
var readline = require("readline");
var Eq_1 = require("fp-ts/lib/Eq");
var content = [
    {
        duration: 100.0,
        dependson: [],
        triggerId: "top-of-show-stage",
        waitfor: [], type: "file"
    },
    { duration: 100.0, dependson: [], triggerId: "calibration-stage", waitfor: ["top-of-show-stage"], type: "file" },
    { duration: 5000.0, dependson: [], triggerId: "calibration-vote", waitfor: ["calibration-stage"], type: "vote" },
    { duration: 100, dependson: [], triggerId: "post-house-ambient", waitfor: ["calibration-vote"], type: "file" },
    { duration: 5000, dependson: [], triggerId: "post-house-vote", waitfor: ["calibration-vote"], type: "vote" },
    { duration: 100.0, dependson: [["calibration-vote", "food"]], triggerId: "stage-vote-food", waitfor: ["calibration-vote"], type: "file" },
    { duration: 60.0, dependson: [["calibration-vote", "drink"]], triggerId: "stage-vote-drink", waitfor: ["calibration-vote"], type: "file" },
    { duration: 100.0, dependson: [], triggerId: "film-vote-trigger", waitfor: ["stage-vote-food"], type: "file" },
    { duration: 100.0, dependson: [], triggerId: "film-vote-trigger", waitfor: ["stage-vote-drink"], type: "file" }
];
var state = {};
function run(content) {
    var isActive = pipeable_1.pipe(content.dependson, fp_ts_1.array.map(function (dependson) { return pipeable_1.pipe(fp_ts_1.record.lookup(dependson[0], state), fp_ts_1.option.map(function (r) { return r === dependson[1]; }), fp_ts_1.option.getOrElse(function () { return false; })); }), Monoid_1.fold(Monoid_1.monoidAll));
    if (isActive) {
        console.log("Running: " + content.triggerId);
        var to = setTimeout(function () { return finishContent(content.triggerId); }, content.duration);
        if (content.type === "vote") {
            console.log("vote on " + content.triggerId);
            getStrLn().then(function (result) {
                state = fp_ts_1.record.insertAt(content.triggerId, result)(state);
                finishContent(content.triggerId);
                clearTimeout(to);
            });
        }
    }
}
function finishContent(triggerId) {
    pipeable_1.pipe(content, fp_ts_1.array.filter(function (c) { return fp_ts_1.array.elem(Eq_1.eqString)(triggerId, c.waitfor); }), fp_ts_1.array.map(run));
}
var getStrLn = function () {
    return new Promise(function (resolve) {
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('> ', function (answer) {
            rl.close();
            resolve(answer);
        });
    });
};
run(content[0]);
