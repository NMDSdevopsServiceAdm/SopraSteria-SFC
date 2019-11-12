import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WeeklyContractedHoursComponent } from './weekly-contracted-hours.component';

describe('AverageWeeklyHoursComponent', () => {
  let component: WeeklyContractedHoursComponent;
  let fixture: ComponentFixture<WeeklyContractedHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WeeklyContractedHoursComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklyContractedHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
