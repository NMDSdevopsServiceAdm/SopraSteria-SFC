import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AverageWeeklyHoursComponent } from './average-weekly-hours.component';

describe('AverageWeeklyHoursComponent', () => {
  let component: AverageWeeklyHoursComponent;
  let fixture: ComponentFixture<AverageWeeklyHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AverageWeeklyHoursComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AverageWeeklyHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
