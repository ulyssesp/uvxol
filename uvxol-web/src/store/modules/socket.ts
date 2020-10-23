export default class Socket {
  private readonly SERVER_URL = "localhost";
  private readonly SERVER_PORT = 9981
  timeout: number = 1000;
  socket: WebSocket | undefined;
  connected: boolean = false;
  connectTimeout: number | undefined;

  constructor() {
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(`ws://${this.SERVER_URL}:${this.SERVER_PORT}`);
    this.socket.addEventListener('open', this.connectHandler.bind(this));
    this.socket.addEventListener('close', this.closeHandler.bind(this));
    this.socket.addEventListener('error', () => { });
  }

  connectHandler() {
    this.connected = true;
  }

  closeHandler() {
    this.connected = false;
  }

  send(message: string) {
    if (this.connected && this.socket) {
      this.socket.send(message + "\n");
    } else {
      console.error("Not connected, reconnecting in 1 second");
      if (!this.connectTimeout) {
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
