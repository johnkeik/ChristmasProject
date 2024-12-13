import { Component } from '@angular/core';
import { FaceDetectionComponent } from '../face-detection/face-detection.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-station',
  standalone: true,
  imports: [FaceDetectionComponent, CommonModule],
  templateUrl: './station.component.html',
  styleUrl: './station.component.scss'
})
export class StationComponent {
showBanner = false;
  toggleBanner() {
    this.showBanner = true;

    setTimeout(() => {
      this.showBanner = false;
    },5000)
  }
}
