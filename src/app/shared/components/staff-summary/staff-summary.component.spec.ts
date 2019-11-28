import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EligibilityIconComponent } from '../eligibility-icon/eligibility-icon.component';
import { StaffSummaryComponent } from './staff-summary.component';

describe('StaffSummaryComponent', () => {
  let component: StaffSummaryComponent;
  let fixture: ComponentFixture<StaffSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [StaffSummaryComponent, EligibilityIconComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
