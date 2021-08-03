import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
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
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: '/registration',
                  },
                ],
              },
            },
          },
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

  describe('setBackLink()', () => {
    it('should set the correct back link when in the parent flow', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'find-workplace-address'],
      });
    });
  });
});
