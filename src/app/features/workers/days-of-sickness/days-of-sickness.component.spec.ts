import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysOfSicknessComponent } from './days-of-sickness.component';

describe('DaysOfSicknessComponent', () => {
  let component: DaysOfSicknessComponent;
  let fixture: ComponentFixture<DaysOfSicknessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DaysOfSicknessComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaysOfSicknessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
