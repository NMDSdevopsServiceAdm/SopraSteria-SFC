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
import { SecurityQuestionComponent } from './security-question.component';

describe('SecurityQuestionComponent', () => {
  async function setup(insideActivationFlow = true) {
    const { getByText, getByTestId, fixture, getAllByText } = await render(SecurityQuestionComponent, {
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

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      router,
      spy,
      getByTestId,
      getByText,
      getAllByText,
    };
  }

  it('should render a SecurityQuestionComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the continue button when inside the flow', async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should show the Save and return button and a cancel link when inside the flow', async () => {
    const { component, fixture, getByText } = await setup();

    component.insideFlow = false;
    component.flow = '/activate-account/78kkh676/confirm-account-details';
    fixture.detectChanges();
    const cancelLink = getByText('Cancel');

    expect(getByText('Save and return')).toBeTruthy();
    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual('/activate-account/78kkh676/confirm-account-details');
  });

  it('should not let you submit with no question', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['securityQuestion'].markAsDirty();
    form.controls['securityQuestion'].setValue('');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Enter a security question', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with no answer', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['securityQuestionAnswer'].markAsDirty();
    form.controls['securityQuestionAnswer'].setValue('');

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Enter your answer to the security question', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with long question', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['securityQuestion'].markAsDirty();
    form.controls['securityQuestion'].setValue(
      'hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123',
    );

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Security question must be 255 characters or fewer', { exact: false }).length).toBe(2);
  });

  it('should not let you submit with long answer', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();
    const continueButton = getByText('Continue');
    const form = component.form;

    form.controls['securityQuestionAnswer'].markAsDirty();
    form.controls['securityQuestionAnswer'].setValue(
      'hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123hello123',
    );

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText('Answer must be 255 characters or fewer', { exact: false }).length).toBe(2);
  });

  it('should navigate to confirm-details if form is valid', async () => {
    const { component, spy, fixture, getByText } = await setup();
    const form = component.form;

    form.controls['securityQuestion'].markAsDirty();
    form.controls['securityQuestion'].setValue('question');

    form.controls['securityQuestionAnswer'].markAsDirty();
    form.controls['securityQuestionAnswer'].setValue('answer');

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['/activate-account', '78kkh676', 'confirm-account-details']);
  });

  it('should navigate to confirm-details when submitting form and not in the flow', async () => {
    const { component, spy, getByText, fixture } = await setup(false);

    const form = component.form;

    component.return = { url: ['/activate-account', '78kkh676', 'confirm-account-details'] };

    form.controls['securityQuestion'].markAsDirty();
    form.controls['securityQuestion'].setValue('question');

    form.controls['securityQuestionAnswer'].markAsDirty();
    form.controls['securityQuestionAnswer'].setValue('answer');

    const submitButton = getByText('Save and return');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['/activate-account', '78kkh676', 'confirm-account-details']);
  });
});
