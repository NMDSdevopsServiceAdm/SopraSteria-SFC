import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationModule } from '../../../registration/registration.module';
import { NewWorkplaceNotFoundComponent } from './new-workplace-not-found.component';

describe('NewWorkplaceNotFoundComponent', () => {
  async function setup(flow, postcodeOrLocationId = '', searchMethod = '', useDifferentLocationIdOrPostcode = false) {
    const component = await render(NewWorkplaceNotFoundComponent, {
      imports: [SharedModule, RegistrationModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: RegistrationService,
          useClass: RegistrationService,
          useValue: {
            postcodeOrLocationId$: {
              value: postcodeOrLocationId,
            },
            searchMethod$: {
              value: searchMethod,
            },
            useDifferentLocationIdOrPostcode$: {
              value: useDifferentLocationIdOrPostcode,
              next: () => {
                return true;
              },
            },
          },
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: flow,
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
    };
  }

  it('should create', async () => {
    const { component } = await setup('registration');
    expect(component).toBeTruthy();
  });

  it('should display the CQC location id or postcode entered in the previous page', async () => {
    const inputtedPostcode = 'SE1 1AA';
    const { component } = await setup('registration', inputtedPostcode);

    expect(component.getByText(inputtedPostcode)).toBeTruthy();
  });

  describe('Registration journey', () => {
    it('should navigate to the find workplace page when selecting yes', async () => {
      const { component, spy } = await setup('registration');
      const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/registration', 'find-workplace']);
    });

    it('should navigate to the workplace name and address page when selecting no', async () => {
      const { component, spy } = await setup('registration');
      const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/registration', 'workplace-name-address']);
    });

    it('should display an error message when not selecting anything', async () => {
      const { component } = await setup('registration');

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      const errorMessage = component.getByTestId('errorMessage');
      expect(errorMessage.innerText).toContain('Select yes if you want to try a different location ID or postcode.');
    });

    it('should display the correct heading', async () => {
      const { component } = await setup('registration');
      const expectedHeading = 'We could not find your workplace';

      expect(component.getByText(expectedHeading)).toBeTruthy();
    });
  });

  describe('Parent journey', () => {
    it('should navigate to the find workplace page when selecting yes', async () => {
      const { component, spy } = await setup('add-workplace');
      const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/add-workplace', 'find-workplace']);
    });

    it('should navigate to the workplace name page when selecting no', async () => {
      const { component, spy } = await setup('add-workplace');
      const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/add-workplace', 'workplace-name-address']);
    });

    it('should display the correct heading', async () => {
      const { component } = await setup('add-workplace');
      const expectedHeading = 'We could not find the workplace';
      component.fixture.componentInstance.isParent = true;
      component.fixture.detectChanges();

      expect(component.getByText(expectedHeading)).toBeTruthy();
    });
  });
});
