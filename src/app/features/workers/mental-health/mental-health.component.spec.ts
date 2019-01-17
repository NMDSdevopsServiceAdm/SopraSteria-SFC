import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MentalHealthComponent } from './mental-health.component';

describe('MentalHealthComponent', () => {
  let component: MentalHealthComponent;
  let fixture: ComponentFixture<MentalHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MentalHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MentalHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
