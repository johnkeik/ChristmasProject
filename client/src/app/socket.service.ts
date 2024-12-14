import { Injectable, signal } from '@angular/core';

export const SERVER_IP = '172.23.1.118:4201';
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
  stellaWidth = signal(450);
  instanceIndex = signal(0);
  localPosition = signal(0);
  randomImageIndexes = signal([]);
  isStation = signal(false);
  passengerImages = signal([]);

  constructor() {
    this.socket = new WebSocket(`wss://${SERVER_IP}`);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');

      this.sendWScreenWidth(window.innerWidth);
    };

    this.socket.onmessage = (event) => {
      const decodedMessage = JSON.parse(event.data);
      if (decodedMessage['event'] === 'SET_STATION') {
        this.isStation.set(true);
      }

      if (decodedMessage['event'] == 'UPDATE_POSITION') {
        this.trainPosition.set(decodedMessage['trainPosition']);
        this.localPosition.set(decodedMessage['localPosition']);
        this.virtualScreenWidth.set(decodedMessage['virtualScreenWidth']);
        this.trainWidth.set(decodedMessage['trainWidth']);
        this.wagonWidth.set(decodedMessage['wagonWidth']);
        this.engineWidth.set(decodedMessage['engineWidth']);
        this.stellaWidth.set(decodedMessage['stellaWidth']);
        this.numberOfWagons.set(decodedMessage['numberOfWagons']);
        this.instanceIndex.set(decodedMessage['instanceIndex']);
        this.passengerImages.set(decodedMessage['passengerImages']);
        this.randomImageIndexes.set(decodedMessage['randomImageIndexes']);
      }
      if (decodedMessage['event'] == 'PASSENGER_IMAGES') {
        console.log('passenger images', decodedMessage['passengerImages'])
        this.passengerImages.set(decodedMessage['passengerImages']);
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
      this.socket.send(JSON.stringify({ event: 'SAVE_IMAGE', imageData: imageUrl }));
    }
  }

}
