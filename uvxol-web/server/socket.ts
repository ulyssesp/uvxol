import * as net from 'net';

export default class Socket {
  private readonly SERVER_URL = "localhost";
  private readonly SERVER_PORT = 5959
  timeout: number = 1000;
  socket: net.Socket;
  connected: boolean = false;
  
  constructor() {
    this.socket = new net.Socket();
    this.socket.on('connect', this.connectHandler.bind(this));
    this.socket.on('timeout', this.timeoutHandler.bind(this));
    this.socket.on('close', this.closeHandler.bind(this));
    this.socket.on('error', () => {});
  }
  
  connectHandler() {
    this.connected = true;
  }
  
  closeHandler() {
        this.connected = false;
        this.timeoutHandler();
  }
  
  timeoutHandler() {
    return setTimeout(this.makeConnection.bind(this), this.timeout);
  }

  makeConnection() {
    return new Promise(
      (resolve) => 
         this.socket.connect(
           this.SERVER_PORT,
           this.SERVER_URL,
           resolve));
  }

  send(message: string) {
    if(this.connected) {
      this.socket.write(message + "\n");
    } else {
      console.error("Not connected");
    }
  }

  dispose() {
    this.socket.destroy()
  }
}
