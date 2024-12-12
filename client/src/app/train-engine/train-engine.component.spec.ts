import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainEngineComponent } from './train-engine.component';

describe('TrainEngineComponent', () => {
  let component: TrainEngineComponent;
  let fixture: ComponentFixture<TrainEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainEngineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
