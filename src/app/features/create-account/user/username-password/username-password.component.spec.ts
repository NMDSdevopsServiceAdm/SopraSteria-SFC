import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { UsernamePasswordComponent } from './username-password.component';

describe('UsernamePasswordComponent', () => {
  async function setup() {
    const component = await render(UsernamePasswordComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: LocationService,
          useClass: MockLocationService,
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
                    path: 'registration',
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

  it('should render a UsernamePasswordComponent', async () => {
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

  it('should not let you submit with no username', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Enter your username', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with no password', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('hello123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Enter a password', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with wrong password confirmation', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('hello123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('Hello123!');
    form.get(['passwordGroup', 'confirmPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'confirmPasswordInput']).setValue('Hello124!');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(
      component.getAllByText('Confirmation password does not match the password you entered', { exact: false }).length,
    ).toBe(2);
  });

  it('should not let you submit with no password confirmation', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('hello123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('Hello123!');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Enter the password again', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with a username over 120 characters', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue(
      'hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123',
    );

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Username must be 120 characters or fewer', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with a username under 3 characters', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('1');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Username must be 3 characters or more', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with a duplicate username', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('duplicate');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(
      component.getAllByText('Enter a different username, this one is not available', { exact: false }).length,
    ).toBe(2);
  });

  it('should not let you submit with a username with special characters', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('username123!');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(
      component.getAllByText('Username can only contain letters, numbers, underscores and hyphens', { exact: false })
        .length,
    ).toBe(2);
  });

  it('should not let you submit with an insecure password', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('hello!');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(
      component.getAllByText(
        'Password must be at least 8 characters long and have uppercase letters, lowercase letters, numbers and special characters like !, £',
        { exact: false },
      ).length,
    ).toBe(2);
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

  it('should navigate to next page if successful', async () => {
    const { component, spy } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('username123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('Hello123!');
    form.get(['passwordGroup', 'confirmPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'confirmPasswordInput']).setValue('Hello123!');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['/registration/create-security-question']);
  });

  it('should navigate to confirm-details if return URL is not null', async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;

    component.fixture.componentInstance.return = { url: ['registration', 'confirm-details'] };

    form.controls['username'].markAsDirty();
    form.controls['username'].setValue('username123');
    form.get(['passwordGroup', 'createPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'createPasswordInput']).setValue('Hello123!');
    form.get(['passwordGroup', 'confirmPasswordInput']).markAsDirty();
    form.get(['passwordGroup', 'confirmPasswordInput']).setValue('Hello123!');

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['/registration/confirm-details']);
  });

  describe('setBackLink()', () => {
    it('should set the back link to your-details if feature flag is on and return url is null', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'your-details'],
      });
    });

    it('should set the back link to confirm-details if the feature flag is on and return url is not null', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.return = { url: ['registration', 'confirm-details'] };
      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'confirm-details'],
      });
    });
  });
});
