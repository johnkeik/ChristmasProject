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

      this.socket.send(JSON.stringify({ event: 'UPDATE_SCREEN_WIDTH', screenWidth: window.innerWidth }));
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'assignIndex') {
        this.clientIndex = message.index;
        console.log(`Assigned client index: ${this.clientIndex}`);
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

  sendImage(imageUrl: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event: 'IMAGE', imageData: imageUrl }));
    }
  }

}
