import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './socket.service';
import { SantaComponent } from './santa/santa.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SantaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'ChristmasProject';
  @ViewChild('object') objectRef!: ElementRef<HTMLDivElement>;
  isAnimating = false;

  constructor(public socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.listenForStartAnimation(() => {
      this.startAnimation();
    });
  }

  startAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const object = this.objectRef.nativeElement;
    const containerWidth = window.innerWidth;
    // Reset position
    console.log('comming here', object.clientLeft);
    object.style.left = '-1020px';

    // Set duration and animate
    const duration = 3000; // 5 seconds
    object.style.transition = `left ${duration / 1000}s linear`;

    // Move the object
    object.style.left = `${containerWidth}px`;
    console.log('comming here', object.clientLeft);
    // Wait for the transition to finish
    setTimeout(() => {
      this.isAnimating = false;
      object.style.transition = 'none';
      object.style.left = '-1020px';
      this.socketService.notifyObjectExited();
    }, duration);
  }
}
