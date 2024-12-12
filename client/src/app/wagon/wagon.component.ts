import { Component, input } from '@angular/core';

@Component({
  selector: 'app-wagon',
  standalone: true,
  imports: [],
  templateUrl: './wagon.component.html',
  styleUrl: './wagon.component.scss'
})
export class WagonComponent {
  width = input(0);

}
