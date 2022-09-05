import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NameOfWorkplaceComponent } from './name-of-workplace.component';

describe('NameOfWorkplaceComponent', () => {
  async function setup(registrationFlow = true) {
    const component = await render(NameOfWorkplaceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: EstablishmentService,
          useValue: {},
        },
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
                    path: registrationFlow ? 'registration' : 'confirm-details',
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

  it('should render a NameOfWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace and user account progress bars', async () => {
    const { component } = await setup();

    expect(component.getByTestId('progress-bar-1')).toBeTruthy();
    expect(component.getByTestId('progress-bar-2')).toBeTruthy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
    const { component } = await setup(false);

    expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
    expect(component.queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should render the correct heading when in the registration journey', async () => {
    const { component } = await setup();

    const registrationHeading = component.queryByText(`What's the name of your workplace?`);

    expect(registrationHeading).toBeTruthy();
  });

  it('should prefill the workplace name if it exists', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;

    component.fixture.componentInstance.registrationService.selectedLocationAddress$.value.locationName =
      'Workplace Name';
    component.fixture.componentInstance.ngOnInit();

    expect(form.value.workplaceName).toEqual('Workplace Name');
  });

  it('should display an error when continue is clicked without adding a workplace name', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.registrationService.selectedLocationAddress$.value.locationName = null;
    component.fixture.componentInstance.ngOnInit();

    const form = component.fixture.componentInstance.form;
    const errorMessage = 'Enter the name of your workplace';

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage).length).toBe(2);
  });

  it('should navigate to type-of-employer url when continue button is clicked and a workplace name is given', async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');

    form.controls['workplaceName'].setValue('Place Name');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['registration', 'type-of-employer']);
  });

  it('should set locationName in registration service when continue button is clicked and a workplace name is given', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');
    const registrationService = component.fixture.componentInstance.registrationService;

    form.controls['workplaceName'].setValue('Place Name');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(registrationService.selectedLocationAddress$.value.locationName).toBe('Place Name');
  });

  describe('setBackLink()', () => {
    it('should set the correct back link when in the registration flow', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'select-workplace-address'],
      });
    });
  });
});
