import { Component, input } from '@angular/core';

@Component({
  selector: 'app-train-engine',
  standalone: true,
  imports: [],
  templateUrl: './train-engine.component.html',
  styleUrl: './train-engine.component.scss'
})
export class TrainEngineComponent {
  width = input(0);

}
