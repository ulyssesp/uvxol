export default class Socket {
  private readonly SERVER_URL = "localhost";
  private readonly SERVER_PORT = 9981
  timeout: number = 1000;
  socket: WebSocket;
  connected: boolean = false;

  constructor() {
    this.socket = new WebSocket(`ws://${this.SERVER_URL}:${this.SERVER_PORT}`);
    this.socket.addEventListener('open', this.connectHandler.bind(this));
    this.socket.addEventListener('close', this.closeHandler.bind(this));
    this.socket.addEventListener('error', () => { });
  }

  connectHandler() {
    this.socket.send("hi!");
    this.connected = true;
  }

  closeHandler() {
    this.connected = false;
  }

  send(message: string) {
    if (this.connected) {
      this.socket.send(message + "\n");
    } else {
      console.error("Not connected");
    }
  }

  dispose() {
    this.socket.close();
  }
}
