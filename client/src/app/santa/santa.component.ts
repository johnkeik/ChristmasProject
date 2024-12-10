import { Component } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-santa',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './santa.component.html',
  styleUrl: './santa.component.scss'
})
export class SantaComponent {
  options: AnimationOptions = {
    path: '../../assets/animations/santa.json',
    loop: true,
    autoplay: true
  };

  private animationItem!: AnimationItem;

  onAnimationCreated(animation: AnimationItem): void {
    this.animationItem = animation;
    this.animationItem.setSpeed(3)
  }
}
