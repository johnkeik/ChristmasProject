import { Component, computed, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './socket.service';
import { SantaComponent } from './santa/santa.component';
import { StationComponent } from './station/station.component';
import { WagonComponent } from "./wagon/wagon.component";
import { TrainEngineComponent } from "./train-engine/train-engine.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SantaComponent, StationComponent, WagonComponent, TrainEngineComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ChristmasProject';
  @ViewChild('object') objectRef!: ElementRef<HTMLDivElement>;
  isAnimating = false;
  isStation = false;
  screenWidth = signal(0);
  localPosition = computed(() => {
    let offset = 0.0;

    for (let i = 0; i < this.socketService.instanceIndex(); i++) {
      offset += this.screenWidth();
    }

    let relativePosition = this.socketService.trainPosition() - offset;
    if (relativePosition < -this.socketService.trainWidth()) {
      relativePosition += this.socketService.virtualScreenWidth() + this.socketService.trainWidth();
    }

    if (this.socketService.instanceIndex() == 0 &&
      this.screenWidth() != this.socketService.virtualScreenWidth() &&
      (this.socketService.trainPosition() + this.socketService.trainWidth()) > this.socketService.virtualScreenWidth()) {
      relativePosition = -(this.socketService.virtualScreenWidth() - this.socketService.trainPosition());
    }

    return relativePosition;
  });

  isTrainVisible = computed(() => {
    return this.localPosition() + this.socketService.trainWidth() > 0 && this.localPosition() < this.screenWidth();
  });

  constructor(public socketService: SocketService) { }
  ngOnInit(): void {
    console.log('AppComponent initialized');
    this.socketService.sendWScreenWidth(this.screenWidth());
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth.set(window.innerWidth);
    this.socketService.sendWScreenWidth(this.screenWidth());
  }



}
