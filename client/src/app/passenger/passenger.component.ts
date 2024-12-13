import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-passenger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './passenger.component.html',
  styleUrl: './passenger.component.scss'
})
export class PassengerComponent implements OnInit {
  type: PassengerType;
  passengerType = PassengerType;
  passengerImage = input.required<string>();
  randomPassengerImageIndex = input.required<number>();
  index = input.required<number>();

  constructor() {
    this.type = PassengerType.santa;
  }

  ngOnInit(): void {
    this.type = this._getRandomePassengerType();
    console.log('passengerType', this.type);
  }



  _getRandomePassengerType(): PassengerType {
    return (PassengerType[Object.values(PassengerType)[this.randomPassengerImageIndex()]] as PassengerType)
  }
}

enum PassengerType {
  santa = 'santa',
  deer = 'deer',
  snowman = 'snowman',
  penguin = 'penguin',
}