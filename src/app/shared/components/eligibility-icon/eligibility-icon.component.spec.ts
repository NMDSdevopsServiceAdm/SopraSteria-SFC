import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { EligibilityIconComponent } from './eligibility-icon.component';

describe('EligibilityIconComponent', () => {
  let component: EligibilityIconComponent;
  let fixture: ComponentFixture<EligibilityIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EligibilityIconComponent],
      providers: [{ provide: FeatureFlagsService, useClass: MockFeatureFlagsService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EligibilityIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
