import { Component, computed, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './socket.service';
import { SantaComponent } from './santa/santa.component';
import { StationComponent } from './station/station.component';
import { WagonComponent } from "./wagon/wagon.component";
import { TrainEngineComponent } from "./train-engine/train-engine.component";
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import {
  Container,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { NeonTextComponent } from "./neon-text/neon-text.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,StationComponent, WagonComponent, TrainEngineComponent, NgxParticlesModule, NeonTextComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ChristmasProject';
  @ViewChild('object') objectRef!: ElementRef<HTMLDivElement>;
  isAnimating = false;
  isStation = false;
  screenWidth = signal(0);
  localPosition = computed(() => this.socketService.localPosition());
  passengerImages = computed(() => {
    return this.socketService.passengerImages().reverse();
  });

  isTrainVisible = computed(() => {
    return this.localPosition() + this.socketService.trainWidth() > 0 && this.localPosition() < this.screenWidth();
  });



  snow = "tsparticles-snow";


  /* or the classic JavaScript object */
  snowOptions = {
    fpsLimit: 120,
    particles: {
      color: {
        value: "#ffffff",
      },
      move: {
        direction: MoveDirection.bottom,
        enable: true,
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 300,
      },
      opacity: {
        value: 0.5,
      },
      // shape: {
      //   type: "circle",
      // },
      shape: {
        type: "emoji", // Use custom snowflake shape
        options: {
          emoji: {
            value: "❄️"
          }
        }
      },
      size: {
        value: { min: 5, max: 10 },
      },
    },
    detectRetina: true,
  };

  constructor(private readonly ngParticlesService: NgParticlesService, public socketService: SocketService) { }



  ngOnInit(): void {
    console.log('AppComponent initialized');
    this.socketService.sendWScreenWidth(this.screenWidth());

    this.ngParticlesService.init(async (engine) => {
      console.log(engine);

      // Starting from 1.19.0 you can add custom presets or shape here, using the current tsParticles instance (main)
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadFull(engine);
      await loadSlim(engine);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth.set(window.innerWidth);
    this.socketService.sendWScreenWidth(this.screenWidth());
  }



}
