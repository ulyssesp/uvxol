import * as http from 'http';
import * as e from 'fp-ts/lib/Either';
import * as ioref from 'fp-ts/lib/IORef';
import * as t from 'fp-ts/lib/Task';
import * as te from 'fp-ts/lib/TaskEither';
import * as ldjs from 'lambda-designer-js';
import Socket from './socket';
import {flow} from 'fp-ts/lib/function';
import {pipe} from 'fp-ts/lib/pipeable';
const express  = require('express');

const app = express();
const port = 8080 || process.env.PORT;
app.set('port', port);

app.use(express.static('dist'));

const server = http.createServer(app);

const update: (s: Socket) => (ns: ldjs.INode[]) => te.TaskEither<string, void> = s =>
  flow(
    ldjs.validateNodes,
    e.map(ldjs.nodesToJSON),
    te.fromEither,
    te.apFirst(te.tryCatch(() => s.connected ? Promise.resolve() : s.makeConnection(), e => "Couldn't connect")),
    te.chain(r => te.tryCatch(() => Promise.resolve(s.send(r)), e => 'Problem sending'))
  )

const createTDView = () => [
    ldjs.top("rectangle")
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

  send(createTDView())
});

server.on('error', (e) => console.error(e));
