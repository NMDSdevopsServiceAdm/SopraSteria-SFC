import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AverageContractedHoursComponent } from './average-contracted-hours.component';

describe('AverageWeeklyHoursComponent', () => {
  let component: AverageContractedHoursComponent;
  let fixture: ComponentFixture<AverageContractedHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AverageContractedHoursComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AverageContractedHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
