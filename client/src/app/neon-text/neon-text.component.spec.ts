import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeonTextComponent } from './neon-text.component';

describe('NeonTextComponent', () => {
  let component: NeonTextComponent;
  let fixture: ComponentFixture<NeonTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeonTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NeonTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
