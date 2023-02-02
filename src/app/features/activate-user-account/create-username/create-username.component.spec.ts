import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockCreateAccountService } from '@core/test-utils/MockCreateAccountService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ActivateUserAccountModule } from '../activate-user-account.module';
import { CreateUsernameComponent } from './create-username.component';

describe('UsernamePasswordComponent', () => {
  async function setup(insideActivationFlow = true) {
    const component = await render(CreateUsernameComponent, {
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
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: insideActivationFlow ? '78kkh676' : 'confirm-account-details' }],
              },
            },

            snapshot: {
              params: {
                activationToken: '78kkh676',
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const componentInstance = component.fixture.componentInstance;
    const registrationsService = injector.inject(RegistrationService) as RegistrationService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      componentInstance,
      registrationsService,
      spy,
    };
  }

  it('should render a CreateUsernameComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the password as password field when show password is false', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.showPassword = false;

    component.fixture.detectChanges();

    const passwordInput = component.getByTestId('password');
    const confirmPasswordInput = component.getByTestId('confirmpassword');
    expect(passwordInput.getAttribute('type')).toEqual('password');
    expect(confirmPasswordInput.getAttribute('type')).toEqual('password');
  });

  it('should show the password as text field when show password is true', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.showPassword = true;

    component.fixture.detectChanges();

    const passwordInput = component.getByTestId('password');
    const confirmPasswordInput = component.getByTestId('confirmpassword');
    expect(passwordInput.getAttribute('type')).toEqual('text');
    expect(confirmPasswordInput.getAttribute('type')).toEqual('text');
  });

  it('should show password should update when show button pressed', async () => {
    const { component } = await setup();
    const showPasswords = component.getByText('Show passwords');

    fireEvent.click(showPasswords);
    component.fixture.detectChanges();

    expect(component.fixture.componentInstance.showPassword).toEqual(true);
  });

  it('should show password should update when hide button pressed', async () => {
    const { component } = await setup();
    const showPasswords = component.getByText('Show passwords');

    fireEvent.click(showPasswords);
    component.fixture.detectChanges();

    expect(component.fixture.componentInstance.showPassword).toEqual(true);

    const hidePasswords = component.getByText('Hide passwords');
    fireEvent.click(hidePasswords);

    expect(component.fixture.componentInstance.showPassword).toEqual(false);
  });

  it("should check the username isn't a duplicate", async () => {
    const { component, registrationsService } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;
    const spy = spyOn(registrationsService, 'getUsernameDuplicate').and.callThrough();

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('username123!');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith('username123!');
  });
});
