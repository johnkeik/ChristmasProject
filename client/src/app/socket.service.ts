import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: WebSocket;
  trainPosition = signal(0);
  virtualScreenWidth = signal(0);
  trainWidth = signal(400);
  wagonWidth = signal(80);
  numberOfWagons = signal(4);
  engineWidth = signal(100);
  instanceIndex = signal(0);

  constructor() {
    this.socket = new WebSocket('ws://localhost:8088');

    this.socket.onopen = () => {
      console.log('WebSocket connection established');

      this.sendWScreenWidth(window.innerWidth);
    };

    this.socket.onmessage = (event) => {
      const decodedMessage = JSON.parse(event.data);
      if (decodedMessage['event'] == 'UPDATE_POSITION') {
        this.trainPosition.set(decodedMessage['trainPosition']);
        this.virtualScreenWidth.set(decodedMessage['virtualScreenWidth']);
        this.trainWidth.set(decodedMessage['trainWidth']);
        this.wagonWidth.set(decodedMessage['wagonWidth']);
        this.engineWidth.set(decodedMessage['engineWidth']);
        this.numberOfWagons.set(decodedMessage['numberOfWagons']);
        this.instanceIndex.set(decodedMessage['instanceIndex']);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.warn('WebSocket connection closed');
    };
  }

  sendWScreenWidth(width: number) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        'event': 'UPDATE_SCREEN_WIDTH',
        'screenWidth': width,
      }));
    }
  }


  sendImage(imageUrl: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'image', imageData: imageUrl }));
    }
  }

}
