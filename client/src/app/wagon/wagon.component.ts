import { Component, computed, inject, input, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-wagon',
  standalone: true,
  imports: [],
  templateUrl: './wagon.component.html',
  styleUrl: './wagon.component.scss'
})
export class WagonComponent {
  width = input(0);
  index = input(0);
  
  socketService = inject(SocketService);
  passengerImages = computed(() => {
    console.log('dfakjlsdjf', this.socketService.passengerImages())
    const start = this.index() * 5;
    const end = start + 5;
    return this.socketService.passengerImages().slice(start, end);
  });

}
