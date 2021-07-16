import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StartComponent } from './start.component';

describe('StartComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(StartComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to new-regulated-by-cqc url in add-workplace flow when Continue button clicked', async () => {
    const { component, fixture, getByText } = await setup();
    component.createAccountNewDesign = true;
    fixture.detectChanges();

    const continueButton = getByText('Continue');

    expect(continueButton.getAttribute('href')).toBe('/add-workplace/new-regulated-by-cqc');
  });
});
