import { ClientEvent } from "../../types";

export default class Socket {
  private readonly SERVER_URL = "localhost";
  private readonly SERVER_PORT = 9982
  timeout: number = 1000;
  socket: WebSocket | undefined;
  connected: boolean = false;
  connectTimeout: number | undefined;
  private callbacks: ((msg: ClientEvent) => void)[] = [];
  private onConnectedCallback: (() => void) | undefined;

  constructor() {
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(`ws://${this.SERVER_URL}:${this.SERVER_PORT}`);
    this.socket.addEventListener('open', this.connectHandler.bind(this));
    this.socket.addEventListener('close', this.closeHandler.bind(this));
    this.socket.addEventListener('error', () => { });
    this.socket.addEventListener('message', msg => this.callbacks.forEach(f => f(JSON.parse(msg.data))))
  }

  connectHandler() {
    this.connected = true;
    if (this.onConnectedCallback) {
      this.onConnectedCallback();
    }
  }

  closeHandler() {
    this.connected = false;
  }

  onConnected(f: () => void) {
    this.onConnectedCallback = f;
  }

  addListener(f: (msg: ClientEvent) => void) {
    this.callbacks.push(f);
  }

  send(message: string) {
    if (this.connected && this.socket) {
      this.socket.send(message + "\n");
    } else if (!(this.socket && this.socket.CONNECTING)) {
      console.error("Not connected, reconnecting in 1 second");
      if (!this.connectTimeout) {
        console.trace();
        this.connectTimeout = setTimeout(() => {
          this.connectTimeout = undefined;
          this.connect();
        }, 1000) as unknown as number;
      }
    }
  }

  dispose() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
