import * as http from 'http';
import * as e from 'fp-ts/lib/Either';
import * as s from 'fp-ts/lib/State';
import * as arr from 'fp-ts/lib/Array';
import * as ioref from 'fp-ts/lib/IORef';
import * as t from 'fp-ts/lib/Task';
import * as r from 'fp-ts/lib/Record';
import * as tup from 'fp-ts/lib/Tuple';
import * as te from 'fp-ts/lib/TaskEither';
import * as io from 'fp-ts/lib/IO';
import * as ior from 'fp-ts/lib/IORef';
import * as ldjs from 'lambda-designer-js';
import * as WebSocket from 'ws';
import Socket from './socket';
import {flow} from 'fp-ts/lib/function';
import {pipe} from 'fp-ts/lib/pipeable';
const express  = require('express');

const app = express();
const port = 8080 || process.env.PORT;
app.set('port', port);


app.use(express.static('dist'));

const server = http.createServer(app);

const wsQueue = (): t.Task<string> => {
  const messageQueue: string[] = [];
  (new WebSocket.Server({ server })).on('connection', async (ws) => {
    ws.on('message', (message: string) => {
      messageQueue.push(message);
    })
  });

  const getTask: t.Task<string> = 
    pipe(
      t.fromIO(() => messageQueue.pop()),
      t.delay(30),
      t.chain(te.fromPredicate(a => a !== undefined, () => "not connected")),
      te.map(s => s!),
      te.fold(e => getTask, s => t.of<string>(s))
    );


  return pipe(t.of(() => console.log("starting sockets")), t.chain(() => getTask));
}

const update: (s: Socket) => (ns: ldjs.INode[]) => te.TaskEither<string, void> = s =>
  flow(
    ldjs.validateNodes,
    e.map(ldjs.nodesToJSON),
    te.fromEither,
    te.apFirst(te.tryCatch(() => s.connected ? Promise.resolve() : s.makeConnection(), e => "Couldn't connect")),
    te.chain(r => te.tryCatch(() => Promise.resolve(s.send(r)), e => 'Problem sending'))
  )

type Zone = "Z1" | "Z2";
const tdstate: ior.IORef<Record<Zone, string>> = new ior.IORef({
  Z1: "",
  Z2: ""
});

const createTDView = (td: Record<Zone, string>) => [
  ldjs.top("composite").run(arr.map(([z, s]: [Zone, string]) => ldjs.top("moviefilein", { file: ldjs.sp(s) }))(r.toArray(td)))
      .connect(ldjs.top("out"))
      .out()
  ]

server.listen(8080, function() {
  const socket = new Socket();
  const send = flow(
    update(socket),
    te.fold(
      e => t.of(console.error(e)),
      () => t.of(console.log('success'))
    ),
    f => f()
  );

  const wsq = wsQueue();

  const mapping: t.Task<string> = pipe(
    wsq,
    t.map(message => e.parseJSON<string>(message, r => "err: " + r) as e.Either<string, [Zone, string]>),
    te.map(zoneUpdate => r.insertAt(zoneUpdate[0], zoneUpdate[1])),
    te.chain(zoneUpdate => 
      te.fromIOEither(io.of(e.right(tdstate.modify(zoneUpdate))))),
    te.fold(e => t.apSecond(mapping)(t.fromIO(() => console.error(e))), run => { 
      run(); 
      console.log(tdstate.read())
      send(createTDView(tdstate.read()));
      return mapping 
    }) // super dirty
  )

  mapping().then(a => console.log("done?" + a));
});

server.on('error', (e) => console.error(e));
