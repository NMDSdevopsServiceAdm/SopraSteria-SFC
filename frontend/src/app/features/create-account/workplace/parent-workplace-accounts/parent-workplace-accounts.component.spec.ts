import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import {
  MockRegistrationService,
  MockRegistrationServiceWithMainService,
} from '@core/test-utils/MockRegistrationService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ParentWorkplaceAccounts } from './parent-workplace-accounts.component';

describe('ParentWorkplaceAccounts', () => {
  async function setup(mainServicePrefilled = true, registrationFlow = true) {
    const { fixture, getByText, getAllByText, queryByText, getByLabelText, getByTestId, queryByTestId } = await render(
      ParentWorkplaceAccounts,
      {
        imports: [SharedModule, RegistrationModule, FormsModule, ReactiveFormsModule],
        providers: [
          BackService,
          BackLinkService,
          {
            provide: RegistrationService,
            useClass: mainServicePrefilled ? MockRegistrationServiceWithMainService : MockRegistrationService,
          },
          {
            provide: WorkplaceService,
            useClass: MockWorkplaceService,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
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
          UntypedFormBuilder,
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render SelectMainServiceComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render the subheading of Workplace', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('subheading').innerText).toEqual('Workplace');
  });

  it('should show the page title', async () => {
    const { getByText } = await setup();

    const pageTitleText = getByText('Parent workplace accounts');

    expect(pageTitleText).toBeTruthy();
  });

  describe('inside the flow', () => {
    it('should render the workplace and user account progress bars', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar-1')).toBeTruthy();
      expect(getByTestId('progress-bar-2')).toBeTruthy();
    });

    it('should show the continue button', async () => {
      const { getByText } = await setup();

      const buttonText = getByText('Continue');

      expect(buttonText).toBeTruthy();
    });

    it('should go to the registration/add-total-staff url when the button is clicked', async () => {
      const { getByText, spy } = await setup();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration', 'add-total-staff']);
    });

    it('should set the correct back link when in the parent flow', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backLinkService, 'showBackLink');

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalled();
    });
  });

  describe('outside the flow', () => {
    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false, false);

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
      expect(queryByTestId('progress-bar-2')).toBeFalsy();
    });

    it('should show the save and return button', async () => {
      const { getByText } = await setup(false, false);

      const buttonText = getByText('Continue');

      expect(buttonText).toBeTruthy();
    });

    it('should go to the registration/confirm-details url when the button is clicked', async () => {
      const { component, fixture, getByText, spy } = await setup(true, false);

      component.returnToConfirmDetails = true;

      fixture.detectChanges();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration/confirm-details']);
    });
  });
});
