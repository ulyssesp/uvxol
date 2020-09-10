[1mdiff --git a/UVXOL-AzureFunction/Actions/index.ts b/UVXOL-AzureFunction/Actions/index.ts[m
[1mindex 729e15d..c06da99 100644[m
[1m--- a/UVXOL-AzureFunction/Actions/index.ts[m
[1m+++ b/UVXOL-AzureFunction/Actions/index.ts[m
[36m@@ -21,6 +21,7 @@[m [mconst httpTrigger: AzureFunction = async function (context: Context, req: HttpRe[m
         }[m
     } else if (req.method === "POST") {[m
         body = await db.insertAction([m
[32m+[m[32m            req.body.zone,[m[41m[m
             req.body.location,[m
             req.body.type,[m
             req.body.name,[m
[36m@@ -33,6 +34,7 @@[m [mconst httpTrigger: AzureFunction = async function (context: Context, req: HttpRe[m
     } else if (req.method === "PUT") {[m
         body = await db.updateAction([m
             req.body.id,[m
[32m+[m[32m            req.body.zone,[m[41m[m
             req.body.location,[m
             req.body.type,[m
             req.body.name,[m
[1mdiff --git a/UVXOL-AzureFunction/Shared/db.ts b/UVXOL-AzureFunction/Shared/db.ts[m
[1mindex 2bd24f1..2bbad6c 100644[m
[1m--- a/UVXOL-AzureFunction/Shared/db.ts[m
[1m+++ b/UVXOL-AzureFunction/Shared/db.ts[m
[36m@@ -32,7 +32,7 @@[m [mexport const getEvent: (id: EventId) => Promise<any> = async function (id) {[m
             EventId as id, Name as name, Delay as delay, Duration as duration, [m
             (select ET.TriggerId as id from EventTriggers as ET[m
                 where (ET.EventId = E.EventId) for json auto) as triggers,[m
[31m-            (select Actions.ActionId as id, Location as location, FilePath as filePath, Type as type, Name as name[m
[32m+[m[32m            (select Actions.ActionId as id, Zone as zone, Location as location, FilePath as filePath, Type as type, Name as name[m
                 from Actions join EventActions [m
                 on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) [m
                 for json auto[m
[36m@@ -59,7 +59,7 @@[m [mexport const getEvents: () => Promise<any> = async function () {[m
             EventId as id, Name as name, Delay as delay, Duration as duration, [m
             (select ET.TriggerId as id from EventTriggers as ET[m
                 where (ET.EventId = E.EventId) for json auto) as triggers,[m
[31m-            (select Actions.ActionId as id, Location as location, FilePath as filePath, Type as type, Name as name[m
[32m+[m[32m            (select Actions.ActionId as id, Zone as zone, Location as location, FilePath as filePath, Type as type, Name as name[m
                 from Actions join EventActions [m
                 on (EventActions.EventId = E.EventId and Actions.ActionId = EventActions.ActionId) [m
                 for json auto[m
[36m@@ -87,7 +87,7 @@[m [mexport const getEventsForTrigger: (triggerId: number) => Promise<any> = async fu[m
             E.EventId as id, Name as name, Delay as delay, Duration as duration, [m
             (select ET.TriggerId as id from EventTriggers as ET[m
                 where (ET.EventId = E.EventId) for json auto) as triggers,[m
[31m-            (select Actions.ActionId as id, Location as location, FilePath as filePath, Type as type, Name as name,[m
[32m+[m[32m            (select Actions.ActionId as id, Zone as zone, Location as location, FilePath as filePath, Type as type, Name as name,[m
                     (select VO.VoteOptionId as id, VO.Text as text, VO.Name as name from VoteOptions as VO [m
                         join ActionVoteOptions as AVO on (AVO.ActionId = Actions.ActionId and VO.VoteOptionId = AVO.VoteOptionId) [m
                         for json auto) as voteOptions[m
[36m@@ -118,7 +118,7 @@[m [mexport const getStartEvents: () => Promise<any> = async function () {[m
             EventId as id, Name as name, Delay as delay, Duration as duration, [m
             (select ET.TriggerId as id from EventTriggers as ET[m
                 where (ET.EventId = E.EventId) for json auto) as triggers,[m
[31m-            (select Actions.ActionId as id, Location as location, FilePath as filePath, Type as type, Name as name,[m
[32m+[m[32m            (select Actions.ActionId as id, Zone as zone, Location as location, FilePath as filePath, Type as type, Name as name,[m
                     (select VO.VoteOptionId as id, VO.Text as text, VO.Name as name from VoteOptions as VO [m
                         join ActionVoteOptions as AVO on (AVO.ActionId = Actions.ActionId and VO.VoteOptionId = AVO.VoteOptionId) [m
                         for json auto) as voteOptions[m
[36m@@ -145,7 +145,7 @@[m [mexport const getStartEvents: () => Promise<any> = async function () {[m
 [m
 export const getAction: (id: number) => Promise<any> = async function (id) {[m
     return connect.then(() => pool.request().input('id', sql.Int, id)[m
[31m-        .query`select A.ActionId as id, A.Name as name, A.Location as location, A.FilePath as filePath, A.Type as type, [m
[32m+[m[32m        .query`select A.ActionId as id, A.Name as name, A.Zone as zone, A.Location as location, A.FilePath as filePath, A.Type as type,[m[41m [m
             (select VO.VoteOptionId as id, VO.Name as name from VoteOptions as VO [m
                 join ActionVoteOptions as AVO[m
                 on (VO.VoteOptionId = AVO.VoteOptionId and AVO.ActionId = A.ActionId)[m
[36m@@ -157,7 +157,7 @@[m [mexport const getAction: (id: number) => Promise<any> = async function (id) {[m
 [m
 export const getActions: () => Promise<any> = async function () {[m
     return connect.then(() =>[m
[31m-        pool.query`select A.ActionId as id, A.Name as name, A.Location as location, A.FilePath as filePath, A.Type as type, [m
[32m+[m[32m        pool.query`select A.ActionId as id, A.Name as name, A.Zone as zone, A.Location as location, A.FilePath as filePath, A.Type as type,[m[41m [m
             (select VO.VoteOptionId as id, VO.Name as name from VoteOptions as VO [m
                 join ActionVoteOptions as AVO[m
                 on (VO.VoteOptionId = AVO.VoteOptionId and AVO.ActionId = A.ActionId)[m
[36m@@ -274,6 +274,7 @@[m [mexport const insertEvent = async function ([m
 }[m
 [m
 export const insertAction = async function ([m
[32m+[m[32m    zone: string,[m
     location: string,[m
     type: number,[m
     name: string,[m
[36m@@ -282,14 +283,15 @@[m [mexport const insertAction = async function ([m
     filePath?: string) {[m
     return connect[m
         .then(() => pool.request()[m
[32m+[m[32m            .input('zone', sql.NVarChar, zone)[m
             .input('location', sql.NVarChar, location)[m
             .input('type', sql.Int, type)[m
             .input('name', sql.Text, name)[m
             .input('text', sql.Text, text)[m
             .input('filePath', sql.Text, filePath)[m
[31m-            .query`insert into Actions (Location, Type, Name, FilePath, Text) [m
[32m+[m[32m            .query`insert into Actions (Zone, Location, Type, Name, FilePath, Text)[m[41m [m
                 output Inserted.ActionId [m
[31m-                values (@location, @type, @name, @filePath, @text)`)[m
[32m+[m[32m                values (@zone, @location, @type, @name, @filePath, @text)`)[m
         .then(actionResult => {[m
             const actionId = actionResult.recordset[0].ActionId[m
 [m
[36m@@ -484,6 +486,7 @@[m [mexport const updateEvent = async function ([m
 [m
 export const updateAction = async function ([m
     id: ActionId,[m
[32m+[m[32m    zone: string,[m
     location: string,[m
     type: number,[m
     name: string,[m
[36m@@ -493,12 +496,14 @@[m [mexport const updateAction = async function ([m
     return connect[m
         .then(() => pool.request()[m
             .input('id', sql.Int, id)[m
[32m+[m[32m            .input('zone', sql.NVarChar, zone)[m
             .input('location', sql.NVarChar, location)[m
             .input('type', sql.Int, type)[m
             .input('name', sql.Text, name)[m
             .input('text', sql.Text, text)[m
             .input('filePath', sql.Text, filePath)[m
             .query`update Actions set [m
[32m+[m[32m                Zone=@zone,[m
                 Location=@location,[m
                 Type=@type,[m
                 Name=@name,[m
[1mdiff --git a/uvxol-web/src/api/Actions.ts b/uvxol-web/src/api/Actions.ts[m
[1mindex 25cb630..0859813 100644[m
[1m--- a/uvxol-web/src/api/Actions.ts[m
[1m+++ b/uvxol-web/src/api/Actions.ts[m
[36m@@ -1,4 +1,4 @@[m
[31m-import { Action, ActionTypesMap, VoteOptionId, TypesActionMap, EditableAction, ServerType } from '@/types';[m
[32m+[m[32mimport { Action, ActionTypesMap, VoteOptionId, TypesActionMap, EditableAction, ServerType, ActionType } from '@/types';[m
 import { array } from 'fp-ts';[m
 import { mapVoteOption } from './VoteOptions';[m
 import actions from '@/store/modules/actions';[m
[36m@@ -18,7 +18,7 @@[m [mexport const mapAction = (a: any) => Object.assign(a, {[m
 });[m
 [m
 export const postAction:[m
[31m-    (action: ServerType<EditableAction>)[m
[32m+[m[32m    (action: ServerType<EditableAction<ActionType>>)[m
         => Promise<any> = action =>[m
         fetch(actionsuri, {[m
             method: 'POST', body: JSON.stringify(Object.assign(action, { type: ActionTypesMap[action.type] }))[m
[1mdiff --git a/uvxol-web/src/components/ActionVote.vue b/uvxol-web/src/components/ActionVote.vue[m
[1mindex 14f165a..85fdf0e 100644[m
[1m--- a/uvxol-web/src/components/ActionVote.vue[m
[1m+++ b/uvxol-web/src/components/ActionVote.vue[m
[36m@@ -3,26 +3,23 @@[m
     <v-subheader v-text="event.name"></v-subheader>[m
     <v-list three-line>[m
       <v-list-item-group>[m
[31m-        <v-list-item[m
[31m-          v-for="(action, i) in event.actions"[m
[31m-          :key="i"[m
[31m-          >[m
[32m+[m[32m        <v-list-item v-for="(action, i) in event.actions" :key="i">[m
           <v-list-item-content>[m
             <v-list-item-title>[m
               {{ action.name }}[m
               <v-chip-group multiple>[m
[31m-                <v-chip> {{ action.type }}</v-chip>[m
[31m-                <v-chip> {{ action.location }}</v-chip>[m
[32m+[m[32m                <v-chip>{{ action.type }}</v-chip>[m
[32m+[m[32m                <v-chip>{{ action.zone }}</v-chip>[m
[32m+[m[32m                <v-chip>{{ action.location }}</v-chip>[m
               </v-chip-group>[m
             </v-list-item-title>[m
             <v-list-item-subtitle>[m
               {{ action.file }}[m
               <v-list>[m
[31m-                <v-subheader> votes </v-subheader>[m
[31m-                <v-list-item v-for="(voteOption, i) in action.voteOptions"[m
[31m-                  :key="i">[m
[32m+[m[32m                <v-subheader>votes</v-subheader>[m
[32m+[m[32m                <v-list-item v-for="(voteOption, i) in action.voteOptions" :key="i">[m
                   <v-list-item-content>[m
[31m-                    <v-list-item-title> voteOption.name </v-list-item-title>[m
[32m+[m[32m                    <v-list-item-title>voteOption.name</v-list-item-title>[m
                   </v-list-item-content>[m
                 </v-list-item>[m
               </v-list>[m
[36m@@ -35,12 +32,11 @@[m
 </template>[m
 [m
 <script lang="ts">[m
[31m-import { Component, Prop, Vue } from 'vue-property-decorator';[m
[31m-import { ActionEvent } from '../types';[m
[32m+[m[32mimport { Component, Prop, Vue } from "vue-property-decorator";[m
[32m+[m[32mimport { ActionEvent } from "../types";[m
 [m
 @Component[m
 export default class Event extends Vue {[m
[31m-  @Prop({required:true}) event!: ActionEvent;[m
[32m+[m[32m  @Prop({ required: true }) event!: ActionEvent;[m
 }[m
[31m-[m
 </script>[m
[1mdiff --git a/uvxol-web/src/components/ActionsList.vue b/uvxol-web/src/components/ActionsList.vue[m
[1mindex 39388cb..28417e5 100644[m
[1m--- a/uvxol-web/src/components/ActionsList.vue[m
[1m+++ b/uvxol-web/src/components/ActionsList.vue[m
[36m@@ -111,6 +111,7 @@[m [mexport default class ActionsList extends Vue {[m
   headers = [[m
     { text: "name", value: "name" },[m
     { text: "type", value: "type" },[m
[32m+[m[32m    { text: "zone", value: "zone" },[m
     { text: "location", value: "location" },[m
     { text: "file", value: "filePath" },[m
     { text: "voteOptions", value: "voteOptions" },[m
[1mdiff --git a/uvxol-web/src/components/CreateAction.vue b/uvxol-web/src/components/CreateAction.vue[m
[1mindex e836859..6073588 100644[m
[1m--- a/uvxol-web/src/components/CreateAction.vue[m
[1m+++ b/uvxol-web/src/components/CreateAction.vue[m
[36m@@ -18,9 +18,16 @@[m
           </v-col>[m
           <v-col cols="4">[m
             <v-text-field[m
[32m+[m[32m              v-model="editedAction.zone"[m
[32m+[m[32m              label="Zone"[m
[32m+[m[32m              placeholder="where this action will play"[m
[32m+[m[32m            ></v-text-field>[m
[32m+[m[32m          </v-col>[m
[32m+[m[32m          <v-col cols="4">[m
[32m+[m[32m            <v-text-field[m
               v-model="editedAction.location"[m
               label="Location"[m
[31m-              placeholder="where this action will play"[m
[32m+[m[32m              placeholder="the location this will play"[m
             ></v-text-field>[m
           </v-col>[m
           <v-col cols="4">[m
[36m@@ -92,7 +99,8 @@[m [mimport actionStore from "../store/modules/actions";[m
 [m
 const defaultAction = {[m
   name: "",[m
[31m-  location: "FILM",[m
[32m+[m[32m  zone: "FILM",[m
[32m+[m[32m  location: "MAIN_CONTENT",[m
   type: "",[m
   filePath: undefined,[m
   voteOptions: undefined,[m
[36m@@ -107,6 +115,7 @@[m [mconst mapAction: ([m
   val[m
     ? {[m
         name: val.name,[m
[32m+[m[32m        zone: val.zone,[m
         location: val.location,[m
         type: val.type,[m
         filePath: val.filePath,[m
[1mdiff --git a/uvxol-web/src/store/modules/actions.ts b/uvxol-web/src/store/modules/actions.ts[m
[1mindex a4671be..544891e 100644[m
[1m--- a/uvxol-web/src/store/modules/actions.ts[m
[1m+++ b/uvxol-web/src/store/modules/actions.ts[m
[36m@@ -1,6 +1,6 @@[m
 import * as api from '../../api/Actions';[m
 import * as vmod from 'vuex-module-decorators';[m
[31m-import { Action, VoteOptionId, TypesActionMap, EditableAction, ServerType, isServerAction } from '@/types';[m
[32m+[m[32mimport { Action, VoteOptionId, TypesActionMap, EditableAction, ServerType, isServerAction, ActionType } from '@/types';[m
 import { array, task } from 'fp-ts';[m
 import Vue from 'vue';[m
 import store from '@/store';[m
[36m@@ -15,7 +15,7 @@[m [mclass Actions extends vmod.VuexModule {[m
   }[m
 [m
   @vmod.Action({ commit: 'addAction', rawError: true })[m
[31m-  public async createOrUpdateAction(a: ServerType<Action> | ServerType<EditableAction>) {[m
[32m+[m[32m  public async createOrUpdateAction(a: ServerType<Action> | ServerType<EditableAction<ActionType>>) {[m
     return isServerAction(a) ?[m
       api.putAction(a) :[m
       api.postAction(a);[m
[1mdiff --git a/uvxol-web/src/store/modules/run.ts b/uvxol-web/src/store/modules/run.ts[m
[1mindex 267c199..b26044d 100644[m
[1m--- a/uvxol-web/src/store/modules/run.ts[m
[1m+++ b/uvxol-web/src/store/modules/run.ts[m
[36m@@ -63,13 +63,49 @@[m [mconst taskOption: mo.Monad1<'TaskOption'> = {[m
   URI: 'TaskOption',[m
   ...ot.getOptionM(task.task)[m
 }[m
[31m-// Send the location and filepath to the TD server[m
[31m-const createTDTask = (self: Run, a: ty.Action, e: ty.ActionEvent) =>[m
[31m-  pipe([m
[31m-    task.fromIO(() => Run.sendToTD(self, a.location, a.filePath)),[m
[31m-    task.apSecond(task.delay(e.duration)(task.of(option.none)))[m
[32m+[m
[32m+[m[32m// Create a task to be run before event[m
[32m+[m[32mconst eventPrepareTask: (self: Run, e: ty.ActionEvent) => task.Task<void> =[m
[32m+[m[32m  (self, e) =>[m
[32m+[m[32m    // Push the event into the run list[m
[32m+[m[32m    task.fromIO(() => {[m
[32m+[m[32m      self.runList.push([m
[32m+[m[32m        Object.assign(e, {[m
[32m+[m[32m          active: false,[m
[32m+[m[32m          actions: e.actions.map(a =>[m
[32m+[m[32m            // Disable UI elements on start[m
[32m+[m[32m            Object.assign({ active: false }))[m
[32m+[m[32m        }));[m
[32m+[m[32m    });[m
[32m+[m
[32m+[m[32m// Create a task to be run after delay, but before duration[m
[32m+[m[32mconst eventStartTask: (self: Run, e: ty.ActionEvent) => task.Task<void> =[m
[32m+[m[32m  (self, e) => pipe([m
[32m+[m[32m    e.actions.map(actionStartTask(self, e)),[m
[32m+[m[32m    tparallel,[m
[32m+[m[32m    task.apSecond(task.fromIO(() => ))[m
[32m+[m[32m  );[m
[32m+[m
[32m+[m[32m// Create a task to be run after delay, but before duration[m
[32m+[m[32mconst actionStartTask: (self: Run, e: ty.ActionEvent) => (a: ty.Action) => task.Task<void> =[m
[32m+[m[32m  (self, e) => a =>[m
[32m+[m[32m    // Send everything to TD[m
[32m+[m[32m    task.fromIO(() => Run.sendToTD(self, a.zone, a.location, a.filePath, a.voteOptions)),[m
[32m+[m
[32m+[m[32m// Create a task to be run after delay, and after duration[m
[32m+[m[32mconst eventEndTask: (self: Run, e: ty.ActionEvent) => task.Task<void> =[m
[32m+[m[32m  (self, e) => pipe([m
[32m+[m[32m    e.actions.map(actionEndTask(self, e)),[m
[32m+[m[32m    tparallel[m
   );[m
 [m
[32m+[m[32m// Create a task to be run after delay and duration[m
[32m+[m[32mconst actionEndTask: (self: Run, e: ty.ActionEvent) => (a: ty.Action) => task.Task<option.Option<void>> =[m
[32m+[m[32m  (self, e) => a => pipe([m
[32m+[m[32m    ty.isVoteAction(a) ? /* Remove both vote options and video from screen and count votes */[m
[32m+[m[32m  )[m
[32m+[m
[32m+[m
 @Module({ dynamic: true, name: 'runStore', store })[m
 class Run extends VuexModule {[m
 [m
[36m@@ -97,58 +133,69 @@[m [mclass Run extends VuexModule {[m
         () => eventStore.getEventsForTrigger(e.id).then(constVoid),[m
         // Run the events[m
         pipe([m
[31m-          // Push the event into the run list[m
[31m-          task.fromIO(() => { self.runList.push(e); }),[m
[32m+[m[32m          eventPrepareTask(self, e),[m
[32m+[m[32m          // Run start task in parallel to prep task[m
[32m+[m[32m          task.apSecond(pipe([m
[32m+[m[32m            eventStartTask(self, e),[m
[32m+[m[32m            task.delay(e.delay || 0)[m
[32m+[m[32m          )),[m
[32m+[m[32m          // Run end task after start task[m
[32m+[m[32m          task.chain(() => pipe([m
[32m+[m[32m            eventEndTask(self, e),[m
[32m+[m[32m            task.delay(e.duration || 0)[m
[32m+[m[32m          )),[m
[32m+[m
           // Then do the actions[m
           task.apSecond([m
             pipe([m
               e.actions,[m
[31m-              array.map<ty.Action, task.Task<option.Option<void>>[]>(a => [[m
[31m-                createTDTask(self, a, e),[m
[31m-                pipe([m
[31m-                  // Create a Task<Option<_>> from the pending vote options[m
[31m-                  () => Promise.resolve(option.fromNullable(self.pendingVoteOptions[a.id])),[m
[31m-                  // Figure out the voteoptionid that won [m
[31m-                  ta => taskOption.chain(ta, flow([m
[31m-                    // Sort the voteoptions[m
[31m-                    array.sort(ord.ordNumber),[m
[31m-                    // chop into same vote options[m
[31m-                    array.chop(as => {[m
[31m-                      const { init, rest } = array.spanLeft((a: number) => eq.eqNumber.equals(a, as[0]))(as)[m
[31m-                      return [init, rest];[m
[31m-                    }),[m
[31m-                    // convert array of votes to [vote, count] tuple[m
[31m-                    array.map(arr => [arr[0], arr.length] as [number, number]),[m
[31m-                    // convert to nonemptyarray[m
[31m-                    nonEmptyArray.fromArray,[m
[31m-                    // grab the max based on the second tuple element[m
[31m-                    option.map(nonEmptyArray.max(ord.ord.contramap(ord.ordNumber, e => e[1]))),[m
[31m-                    // grab the voteoption id of the tuple[m
[31m-                    option.map(tuple.fst),[m
[31m-                    // Create task[m
[31m-                    task.of[m
[31m-                  )),[m
[31m-                  task.chain(option.fold([m
[31m-                    () => pipe([m
[31m-                      option.fromNullable(a.voteOptions),[m
[31m-                      option.fold<VoteOption[], task.Task<option.Option<VoteOptionId>>>([m
[31m-                        () => task.of<option.Option<number>>(option.none),[m
[31m-                        vo => pipe([m
[31m-                          task.fromIO(rand.randomInt(0, vo.length - 1)),[m
[31m-                          task.map(n => pipe([m
[31m-                            option.fromNullable(vo[n]),[m
[31m-                            option.map(vo => vo.id))[m
[31m-                          ),[m
[32m+[m[32m              array.map<ty.Action, task.Task<option.Option<void>>[]>(a =>[m
[32m+[m[32m                eventStartTask(self, e),[m
[32m+[m[32m                [[m
[32m+[m[32m                  pipe([m
[32m+[m[32m                    // Create a Task<Option<_>> from the pending vote options[m
[32m+[m[32m                    () => Promise.resolve(option.fromNullable(self.pendingVoteOptions[a.id])),[m
[32m+[m[32m                    // Figure out the voteoptionid that won[m[41m [m
[32m+[m[32m                    ta => taskOption.chain(ta, flow([m
[32m+[m[32m                      // Sort the voteoptions[m
[32m+[m[32m                      array.sort(ord.ordNumber),[m
[32m+[m[32m                      // chop into same vote options[m
[32m+[m[32m                      array.chop(as => {[m
[32m+[m[32m                        const { init, rest } = array.spanLeft((a: number) => eq.eqNumber.equals(a, as[0]))(as)[m
[32m+[m[32m                        return [init, rest];[m
[32m+[m[32m                      }),[m
[32m+[m[32m                      // convert array of votes to [vote, count] tuple[m
[32m+[m[32m                      array.map(arr => [arr[0], arr.length] as [number, number]),[m
[32m+[m[32m                      // convert to nonemptyarray[m
[32m+[m[32m                      nonEmptyArray.fromArray,[m
[32m+[m[32m                      // grab the max based on the second tuple element[m
[32m+[m[32m                      option.map(nonEmptyArray.max(ord.ord.contramap(ord.ordNumber, e => e[1]))),[m
[32m+[m[32m                      // grab the voteoption id of the tuple[m
[32m+[m[32m                      option.map(tuple.fst),[m
[32m+[m[32m                      // Create task[m
[32m+[m[32m                      task.of[m
[32m+[m[32m                    )),[m
[32m+[m[32m                    task.chain(option.fold([m
[32m+[m[32m                      () => pipe([m
[32m+[m[32m                        option.fromNullable(a.voteOptions),[m
[32m+[m[32m                        option.fold<VoteOption[], task.Task<option.Option<VoteOptionId>>>([m
[32m+[m[32m                          () => task.of<option.Option<number>>(option.none),[m
[32m+[m[32m                          vo => pipe([m
[32m+[m[32m                            task.fromIO(rand.randomInt(0, vo.length - 1)),[m
[32m+[m[32m                            task.map(n => pipe([m
[32m+[m[32m                              option.fromNullable(vo[n]),[m
[32m+[m[32m                              option.map(vo => vo.id))[m
[32m+[m[32m                            ),[m
[32m+[m[32m                          )[m
                         )[m
[31m-                      )[m
[31m-                    ),[m
[31m-                    n => task.of(option.some(n))[m
[31m-                  )),[m
[31m-                  // Set chosenVoteOptions[winningVoteOptionId] to winningVoteOptionId[m
[31m-                  t => taskOption.ap(taskOption.of(r => { Vue.set(self.chosenVoteOptions, r, r); }), t),[m
[31m-                  task.delay(e.duration || 0)[m
[31m-                )[m
[31m-              ]),[m
[32m+[m[32m                      ),[m
[32m+[m[32m                      n => task.of(option.some(n))[m
[32m+[m[32m                    )),[m
[32m+[m[32m                    // Set chosenVoteOptions[winningVoteOptionId] to winningVoteOptionId[m
[32m+[m[32m                    t => taskOption.ap(taskOption.of(r => { Vue.set(self.chosenVoteOptions, r, r); }), t),[m
[32m+[m[32m                    task.delay(e.duration || 0)[m
[32m+[m[32m                  )[m
[32m+[m[32m                ]),[m
               array.flatten,[m
               tparallel,[m
               // Wait out the delay[m
[36m@@ -168,12 +215,12 @@[m [mclass Run extends VuexModule {[m
       ])),[m
     )[m
 [m
[31m-  static sendToTD: (self: Run, location: string, filePath: string | undefined) => void =[m
[31m-    (self, location, filePath) =>[m
[31m-      socket.send(JSON.stringify({ location, filePath }))[m
[32m+[m[32m  static sendToTD: (self: Run, zone: string, location: string, filePath: string | undefined, voteOptions: VoteOption[] | undefined) => void =[m
[32m+[m[32m    (self, zone, location, filePath, voteOptions) =>[m
[32m+[m[32m      socket.send(JSON.stringify({ zone, location, filePath, voteOptions }))[m
 [m
   // List of events that have run. Used for Debugging purposes.[m
[31m-  public runList: ActionEvent[] = [];[m
[32m+[m[32m  public runList: ty.ViewEvent[] = [];[m
   public chosenVoteOptions: { [id: number]: number } = {};[m
   public pendingVoteOptions: { [id: number]: Array<number> } = {};[m
 [m
[1mdiff --git a/uvxol-web/src/types.ts b/uvxol-web/src/types.ts[m
[1mindex b22ec8b..325367f 100644[m
[1m--- a/uvxol-web/src/types.ts[m
[1m+++ b/uvxol-web/src/types.ts[m
[36m@@ -9,28 +9,37 @@[m [mtype RequireId<T> =[m
     }[keyof T], undefined>;[m
 [m
 export type ServerType<T> = Omit<T, RequireId<T>> & { [K in RequireId<T>]: number[] | Extract<T[RequireId<T>], undefined> };[m
[31m-export type ServerAction<T extends Action | EditableAction> =[m
[32m+[m[32mexport type ServerAction<T extends Action | EditableAction<any>> =[m
     Omit<ServerType<T>, "type"> & { type: number };[m
 [m
 export type ActionId = number;[m
 [m
[31m-export type Action = { id: ActionId } & EditableAction;[m
[32m+[m[32mexport type Action = { id: ActionId } & EditableAction<ActionType>;[m
 [m
[31m-export type EditableAction = {[m
[31m-    type: string;[m
[32m+[m[32mexport type EditableAction<T extends ActionType> = {[m
[32m+[m[32m    type: T;[m
     name: string;[m
[32m+[m[32m    zone: string;[m
     location: string;[m
     filePath?: string;[m
     voteOptions?: VoteOption[];[m
     text?: string;[m
 }[m
 [m
[31m-export function isServerAction(a: ServerType<EditableAction> | ServerType<Action>): a is ServerType<Action> {[m
[32m+[m[32mexport type ViewAction<T extends ActionType> = EditableAction<T> & { active: boolean };[m
[32m+[m[32mexport type ViewEvent = Omit<ActionEvent, "actions"> & { active: boolean, actions: ViewAction<ActionType>[] };[m
[32m+[m
[32m+[m[32mexport function isServerAction(a: ServerType<EditableAction<ActionType>> | ServerType<Action>): a is ServerType<Action> {[m
     return (a as Action).id !== undefined;[m
 }[m
 [m
[31m-export const ActionTypesMap: { [type: string]: number } = { audio: 0, video: 1, vote: 2 };[m
[31m-export const TypesActionMap: { [type: number]: string } = { 0: 'audio', 1: 'video', 2: 'vote' };[m
[32m+[m[32mexport function isVoteAction(a: EditableAction<ActionType>): a is EditableAction<"vote"> {[m
[32m+[m[32m    return a.type === "vote";[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mexport type ActionType = 'audio' | 'video' | 'vote';[m
[32m+[m[32mexport const ActionTypesMap: { [K in ActionType]: number } = { audio: 0, video: 1, vote: 2 };[m
[32m+[m[32mexport const TypesActionMap: { [type: number]: ActionType } = { 0: 'audio', 1: 'video', 2: 'vote' };[m
 [m
 export type EventId = number;[m
 [m
[1mdiff --git a/uvxol-web/src/views/Runner.vue b/uvxol-web/src/views/Runner.vue[m
[1mindex 8414820..3324ac0 100644[m
[1m--- a/uvxol-web/src/views/Runner.vue[m
[1m+++ b/uvxol-web/src/views/Runner.vue[m
[36m@@ -16,11 +16,11 @@[m
           <Event v-bind:event="event" class="pa-1 flex-grow-1"></Event>[m
         </v-row>[m
       </v-col>[m
[31m-      <v-col v-for="(location, i) in actionLogByLocation" :key="i" cols="2">[m
[32m+[m[32m      <v-col v-for="(zone, i) in actionLogByZone" :key="i" cols="2">[m
         <v-row>[m
[31m-          <v-subheader>{{ location[0] }}</v-subheader>[m
[32m+[m[32m          <v-subheader>{{ zone[0] }}</v-subheader>[m
         </v-row>[m
[31m-        <v-row v-for="(action, i) in location[1]" :key="i" class="mb-3">[m
[32m+[m[32m        <v-row v-for="(action, i) in zone[1]" :key="i" class="mb-3">[m
           <ActionC v-bind:action="action" class="ms-2 pa-1 flex-grow-1"></ActionC>[m
         </v-row>[m
       </v-col>[m
[36m@@ -30,7 +30,14 @@[m
 [m
 <script lang="ts">[m
 import { Component, Prop, Vue, Watch } from "vue-property-decorator";[m
[31m-import { ActionEvent, Action, VoteOption } from "../types";[m
[32m+[m[32mimport {[m
[32m+[m[32m  ActionEvent,[m
[32m+[m[32m  Action,[m
[32m+[m[32m  VoteOption,[m
[32m+[m[32m  ActionType,[m
[32m+[m[32m  ViewAction,[m
[32m+[m[32m  ViewEvent,[m
[32m+[m[32m} from "../types";[m
 import { array, option, show } from "fp-ts";[m
 import { pipe } from "fp-ts/lib/pipeable";[m
 import { constant } from "fp-ts/lib/function";[m
[36m@@ -51,15 +58,19 @@[m [mimport { logid, logval } from "../utils/fp-utils";[m
 })[m
 export default class EventsList extends Vue {[m
   private err = "";[m
[31m-  get actionLogByLocation() {[m
[32m+[m[32m  get actionLogByZone() {[m
     return pipe([m
       this.events,[m
[31m-      array.chain((e) => e.actions),[m
[32m+[m[32m      array.chain((e: ViewEvent) => e.actions),[m
       na.fromArray,[m
[31m-      option.map(na.groupBy((a) => a.location.toLowerCase())),[m
[32m+[m[32m      option.map([m
[32m+[m[32m        na.groupBy((a: ViewAction<ActionType>) => a.zone.toLowerCase())[m
[32m+[m[32m      ),[m
       option.map(r.toArray),[m
       option.map(array.reverse),[m
[31m-      option.getOrElse(constant([] as [string, na.NonEmptyArray<Action>][]))[m
[32m+[m[32m      option.getOrElse([m
[32m+[m[32m        constant([] as [string, na.NonEmptyArray<ViewAction<ActionType>>][])[m
[32m+[m[32m      )[m
     );[m
   }[m
   get log() {[m
