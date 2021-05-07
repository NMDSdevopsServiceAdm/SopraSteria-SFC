import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { EligibilityIconComponent } from '../eligibility-icon/eligibility-icon.component';
import { SummaryRecordValueComponent } from './summary-record-value.component';

describe('SummaryRecordValueComponent', () => {
  let component: SummaryRecordValueComponent;
  let fixture: ComponentFixture<SummaryRecordValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SummaryRecordValueComponent, EligibilityIconComponent],
      providers: [{ provide: FeatureFlagsService, useClass: MockFeatureFlagsService }],
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
