import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { MockCreateAccountService } from '@core/test-utils/MockCreateAccountService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ActivateUserAccountModule } from '../activate-user-account.module';
import { ConfirmAccountDetailsComponent } from './confirm-account-details.component';

describe('ConfirmAccountDetailsComponent', () => {
  async function setup() {
    const { getByText, getByTestId, fixture, getAllByText, queryByText } = await render(
      ConfirmAccountDetailsComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ActivateUserAccountModule],
        providers: [
          BackLinkService,

          {
            provide: CreateAccountService,
            useClass: MockCreateAccountService,
          },
          {
            provide: RegistrationService,
            useClass: MockRegistrationService,
          },
          {
            provide: UserService,
            useClass: MockUserService,
          },

          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                params: {
                  activationToken: '78kkh676',
                },
              },
            },
          },
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const component = fixture.componentInstance;
    const activateAccountService = injector.inject(CreateAccountService) as CreateAccountService;
    const activateAccountSpy = spyOn(activateAccountService, 'activateAccount');

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      router,
      spy,
      activateAccountSpy,
      getByTestId,
      getByText,
      getAllByText,
      queryByText,
    };
  }

  it('should render a ConfirmAccountDetailsComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should have the title Check your details before you submit them', async () => {
    const { queryByText } = await setup();
    const expectedTitle = 'Check these details before you submit them';

    expect(queryByText(expectedTitle, { exact: false })).toBeTruthy();
  });

  it('should display the text to agree to terms and conditions', async () => {
    const { getAllByText } = await setup();
    const expectedText = 'I agree to the ';
    const termsAndConditionsLink = 'terms and conditions';

    expect(getAllByText(expectedText, { exact: false })).toBeTruthy();
    expect(getAllByText(termsAndConditionsLink, { exact: false })).toBeTruthy();
  });

  it('should show an error message when pressing submit without agreeing to terms and conditions', async () => {
    const { fixture, getByText, getAllByText } = await setup();
    const expectedErrorMessage = 'Confirm that you agree to the terms and conditions';

    const submitButton = getByText('Submit details');
    fireEvent.click(submitButton);

    expect(fixture.componentInstance.form.invalid).toBeTruthy();
    expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
  });

  it('should call the save function to create account when pressing submit after agreeing to terms', async () => {
    const { component, fixture, getByText, getByTestId } = await setup();

    const termsAndConditionsCheckbox = getByTestId('checkbox');
    const submitButton = getByText('Submit details');
    const saveSpy = spyOn(component, 'save').and.returnValue(null);

    fireEvent.click(termsAndConditionsCheckbox);
    fireEvent.click(submitButton);

    expect(fixture.componentInstance.form.invalid).toBeFalsy();
    expect(saveSpy).toHaveBeenCalled();
  });
});
