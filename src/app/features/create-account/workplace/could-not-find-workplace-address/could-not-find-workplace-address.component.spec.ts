import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CouldNotFindWorkplaceAddressComponent } from './could-not-find-workplace-address.component';

describe('CouldNotFindWorkplaceAddressComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(CouldNotFindWorkplaceAddressComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: RegistrationService,
          useClass: MockRegistrationService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
      ],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should render a CouldNotFindWorkplaceAddressComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display invalid postcode retrieved from registration service', async () => {
    const { getByText } = await setup();
    const postcodeEnteredMessage = 'Postcode entered:';

    const invalidPostcode = 'ABC 123';
    expect(getByText(invalidPostcode)).toBeTruthy();
    expect(getByText(postcodeEnteredMessage, { exact: false })).toBeTruthy();
  });
});
