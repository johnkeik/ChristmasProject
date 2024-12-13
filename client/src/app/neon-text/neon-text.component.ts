import { Component, input } from '@angular/core';

@Component({
  selector: 'app-neon-text',
  standalone: true,
  imports: [],
  templateUrl: './neon-text.component.html',
  styleUrl: './neon-text.component.scss'
})
export class NeonTextComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
}
