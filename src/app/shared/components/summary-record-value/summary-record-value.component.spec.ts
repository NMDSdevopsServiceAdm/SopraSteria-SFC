import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityIconComponent } from '../eligibility-icon/eligibility-icon.component';
import { SummaryRecordValueComponent } from './summary-record-value.component';

describe('StaffRecordValueComponent', () => {
  let component: SummaryRecordValueComponent;
  let fixture: ComponentFixture<SummaryRecordValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SummaryRecordValueComponent, EligibilityIconComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryRecordValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
