import { Component, computed, inject, input, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';
import { PassengerComponent } from "../passenger/passenger.component";

@Component({
  selector: 'app-wagon',
  standalone: true,
  imports: [PassengerComponent],
  templateUrl: './wagon.component.html',
  styleUrl: './wagon.component.scss'
})
export class WagonComponent {
  width = input(0);
  index = input(0);
  randomPassengerImageIndex = input.required<number>();
  passengerImage = input.required<string>();

  socketService = inject(SocketService);


}
