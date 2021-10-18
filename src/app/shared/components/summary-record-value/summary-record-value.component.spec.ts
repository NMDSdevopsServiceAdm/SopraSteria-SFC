import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EligibilityIconComponent } from '../eligibility-icon/eligibility-icon.component';
import { SummaryRecordValueComponent } from './summary-record-value.component';

describe('SummaryRecordValueComponent', () => {
  let component: SummaryRecordValueComponent;
  let fixture: ComponentFixture<SummaryRecordValueComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SummaryRecordValueComponent, EligibilityIconComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryRecordValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
