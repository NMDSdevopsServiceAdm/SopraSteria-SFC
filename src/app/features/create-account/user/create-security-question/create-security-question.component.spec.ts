import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { LocationService } from '@core/services/location.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { SecurityQuestionComponent } from './create-security-question.component';

describe('SecurityQuestionComponent', () => {
  async function setup(registrationFlow = true) {
    const component = await render(SecurityQuestionComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: LocationService,
          useClass: MockLocationService,
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
    const componentInstance = component.fixture.componentInstance;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      componentInstance,
      spy,
    };
  }

  it('should render a SecurityQuestionComponent', async () => {
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

  it('should show the continue button when inside the flow', async () => {
    const { component } = await setup();

    expect(component.getByText('Continue')).toBeTruthy();
  });

  it('should show the Save and return button and a cancel link when inside the flow', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.insideFlow = false;
    component.fixture.componentInstance.flow = 'registration/confirm-details';
    component.fixture.detectChanges();
    const cancelLink = component.getByText('Cancel');

    expect(component.getByText('Save and return')).toBeTruthy();
    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual('/registration/confirm-details');
  });

  it('should not let you submit with no question', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['securityQuestion'].markAsDirty();
    form.controls['securityQuestion'].setValue('');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Enter a security question', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with no answer', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['securityQuestionAnswer'].markAsDirty();
    form.controls['securityQuestionAnswer'].setValue('');

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Enter your answer to the security question', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with long question', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['securityQuestion'].markAsDirty();
    form.controls['securityQuestion'].setValue(
      'hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123',
    );

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Security question must be 255 characters or fewer', { exact: false }).length).toBe(
      2,
    );
  });

  it('should not let you submit with long answer', async () => {
    const { component } = await setup();
    const continueButton = component.getByText('Continue');
    const form = component.fixture.componentInstance.form;

    form.controls['securityQuestionAnswer'].markAsDirty();
    form.controls['securityQuestionAnswer'].setValue(
      'hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123',
    );

    fireEvent.click(continueButton);
    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Answer must be 255 characters or fewer', { exact: false }).length).toBe(2);
  });

  it('should navigate to confirm-details if form is valid', async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;

    component.fixture.componentInstance.return = { url: ['registration', 'confirm-details'] };

    form.controls['securityQuestion'].markAsDirty();
    form.controls['securityQuestion'].setValue('question');

    form.controls['securityQuestionAnswer'].markAsDirty();
    form.controls['securityQuestionAnswer'].setValue('answer');

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['/registration/confirm-details']);
  });

  it('should navigate to confirm-details when submitting form and not in the flow', async () => {
    const { component, spy } = await setup(false);

    const form = component.fixture.componentInstance.form;

    component.fixture.componentInstance.return = { url: ['registration', 'confirm-details'] };

    form.controls['securityQuestion'].markAsDirty();
    form.controls['securityQuestion'].setValue('question');

    form.controls['securityQuestionAnswer'].markAsDirty();
    form.controls['securityQuestionAnswer'].setValue('answer');

    const submitButton = component.getByText('Save and return');
    fireEvent.click(submitButton);
    component.fixture.detectChanges();

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['/registration/confirm-details']);
  });

  describe('setBackLink()', () => {
    it('should set the back link to username-password if feature flag is on and return url is null', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'username-password'],
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
