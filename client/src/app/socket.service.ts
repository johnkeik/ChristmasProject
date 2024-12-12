import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: WebSocket;
  public clientIndex: number | null = null;

  constructor() {
    this.socket = new WebSocket('wss://192.168.1.3:4201');

    this.socket.onopen = () => {
      console.log('WebSocket connection established');

      this.socket.send(JSON.stringify({ type: 'screenWidth', width: window.innerWidth }));
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.type === 'assignIndex') {
        this.clientIndex = message.index;
        console.log(`Assigned client index: ${this.clientIndex}`);
      } else if (message.type === 'startAnimation') {
        console.log('Received startAnimation event');
        this.startAnimationCallback?.();
      }

      if(message.type === 'widthSum'){
        console.log('total width ', message.widthSum)
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.warn('WebSocket connection closed');
    };
  }

  startAnimationCallback: (() => void) | null = null;

  listenForStartAnimation(callback: () => void): void {
    this.startAnimationCallback = callback;
  }

  notifyObjectExited(): void {
    if (this.clientIndex !== null) {
      this.socket.send(JSON.stringify({ type: 'objectExited' }));
    } else {
      console.warn('Cannot notify server: clientIndex is null');
    }
  }

}
