import { Component } from '@angular/core';
import { FaceDetectionComponent } from '../face-detection/face-detection.component';

@Component({
  selector: 'app-station',
  standalone: true,
  imports: [FaceDetectionComponent],
  templateUrl: './station.component.html',
  styleUrl: './station.component.scss'
})
export class StationComponent {

}
