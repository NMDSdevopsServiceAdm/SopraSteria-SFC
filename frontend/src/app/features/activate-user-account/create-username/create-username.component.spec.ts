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

describe('CreateUsernameComponent', () => {
  async function setup(insideActivationFlow = true) {
    const { getByText, getByTestId, fixture, getAllByText } = await render(CreateUsernameComponent, {
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
    const component = fixture.componentInstance;
    const registrationsService = injector.inject(RegistrationService) as RegistrationService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      router,
      registrationsService,
      spy,
      getByTestId,
      getByText,
      getAllByText,
    };
  }

  it('should render a CreateUsernameComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the password as password field when show password is false', async () => {
    const { component, getByTestId, fixture } = await setup();

    component.showPassword = false;

    fixture.detectChanges();

    const passwordInput = getByTestId('password');
    const confirmPasswordInput = getByTestId('confirmpassword');
    expect(passwordInput.getAttribute('type')).toEqual('password');
    expect(confirmPasswordInput.getAttribute('type')).toEqual('password');
  });

  it('should show the password as text field when show password is true', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.showPassword = true;

    fixture.detectChanges();

    const passwordInput = getByTestId('password');
    const confirmPasswordInput = getByTestId('confirmpassword');
    expect(passwordInput.getAttribute('type')).toEqual('text');
    expect(confirmPasswordInput.getAttribute('type')).toEqual('text');
  });

  it('should show password should update when show button pressed', async () => {
    const { component, getByText, fixture } = await setup();
    const showPasswords = getByText('Show passwords');

    fireEvent.click(showPasswords);
    fixture.detectChanges();

    expect(component.showPassword).toEqual(true);
  });

  it('should show password should update when hide button pressed', async () => {
    const { component, getByText, fixture } = await setup();
    const showPasswords = getByText('Show passwords');

    fireEvent.click(showPasswords);
    fixture.detectChanges();

    expect(component.showPassword).toEqual(true);

    const hidePasswords = getByText('Hide passwords');
    fireEvent.click(hidePasswords);

    expect(component.showPassword).toEqual(false);
  });

  it('should not let you submit with no username', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Enter your username', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with no password', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('hello123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Enter a password', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with wrong password confirmation', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('hello123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('Hello123!');
    form.get(['passwordGroup', 'confirmPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'confirmPasswordInput']).setValue('Hello124!');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Password confirmation does not match the password you entered', { exact: false }).length).toBe(
      2,
    );
  });

  it('should not let you submit with no password confirmation', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('hello123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('Hello123!');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Enter the password again', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with a username over 120 characters', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue(
      'hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123',
    );

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Username must be 120 characters or fewer', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with a username under 3 characters', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('1');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Username must be 3 characters or more', { exact: false }).length).toBe(2);
  });

  it("should check the username isn't a duplicate", async () => {
    const { component, registrationsService, getByText, fixture } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;
    const spy = spyOn(registrationsService, 'getUsernameDuplicate').and.callThrough();

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('username123!');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith('username123!');
  });

  it('should not let you submit with a duplicate username', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('duplicate');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Enter a different username, this one is not available', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with a username with special characters', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('username123!');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(
      getAllByText('Username can only contain letters, numbers, underscores and hyphens', { exact: false }).length,
    ).toBe(2);
  });

  it('should not let you submit with an insecure password', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('hello!');

    fireEvent.click(continueButton);

    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(
      getAllByText(
        'Password must be at least 8 characters long and have uppercase letters, lowercase letters, numbers and special characters like !, £',
        { exact: false },
      ).length,
    ).toBe(2);
  });

  it('should navigate to next page if successful', async () => {
    const { component, spy, getByText, fixture } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('username123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('Hello123!');
    form.get(['passwordGroup', 'confirmPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'confirmPasswordInput']).setValue('Hello123!');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['/activate-account', '78kkh676', 'security-question']);
  });

  it('should navigate to confirm-account-details if return URL is not null and outside flow', async () => {
    const { component, spy, getByText } = await setup(false);
    const form = component.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('username123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('Hello123!');
    form.get(['passwordGroup', 'confirmPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'confirmPasswordInput']).setValue('Hello123!');

    const continueButton = getByText('Save and return');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['/activate-account', '78kkh676', 'confirm-account-details']);
  });
});
