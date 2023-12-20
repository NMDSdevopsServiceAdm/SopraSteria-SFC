import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { CouldNotFindWorkplaceAddressDirective } from '@shared/directives/create-workplace/could-not-find-workplace-address/could-not-find-workplace-address.directive';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { CouldNotFindWorkplaceAddressComponent } from './could-not-find-workplace-address.component';

describe('CouldNotFindWorkplaceAddressComponent', () => {
  async function setup(registrationFlow = true) {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(CouldNotFindWorkplaceAddressComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        RegistrationModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        CouldNotFindWorkplaceAddressDirective,
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

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      spy,
      getByText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render a CouldNotFindWorkplaceAddressComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace and user account progress bars', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
    expect(getByTestId('progress-bar-2')).toBeTruthy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
    const { queryByTestId } = await setup(false);

    expect(queryByTestId('progress-bar-1')).toBeFalsy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should display invalid postcode retrieved from registration service', async () => {
    const { getByText } = await setup();
    const postcodeEnteredMessage = 'Postcode entered:';

    const invalidPostcode = 'ABC 123';
    expect(getByText(invalidPostcode)).toBeTruthy();
    expect(getByText(postcodeEnteredMessage, { exact: false })).toBeTruthy();
  });

  describe('Registration messages', async () => {
    it('should display registration version of heading', async () => {
      const { getByText } = await setup();
      const expectedHeading = 'We could not find your workplace address';

      expect(getByText(expectedHeading)).toBeTruthy();
    });

    it('should display registration version of question', async () => {
      const { getByText } = await setup();
      const expectedQuestion = 'Do you want to try find your workplace with a different postcode?';

      expect(getByText(expectedQuestion)).toBeTruthy();
    });

    it('should display registration version of No answer', async () => {
      const { getByText } = await setup();
      const expectedNoAnswer = "No, I'll enter our workplace details myself";

      expect(getByText(expectedNoAnswer)).toBeTruthy();
    });
  });

  describe('prefillForm()', () => {
    it('should preselect the "Yes" radio button if useDifferentLocationIdOrPostcode has been set to true in the service', async () => {
      const { component } = await setup();

      component.registrationService.useDifferentLocationIdOrPostcode$ = new BehaviorSubject(true);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.useDifferentPostcode).toBe('yes');
    });

    it('should preselect the "No" radio button if useDifferentLocationIdOrPostcode has been set to false in the service', async () => {
      const { component } = await setup();

      component.registrationService.useDifferentLocationIdOrPostcode$ = new BehaviorSubject(false);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.useDifferentPostcode).toBe('no');
    });

    it('should not preselect any radio buttons if useDifferentLocationIdOrPostcode has not been set in the service', async () => {
      const { component } = await setup();

      component.registrationService.useDifferentLocationIdOrPostcode$ = new BehaviorSubject(null);
      component.ngOnInit();

      const form = component.form;
      expect(form.invalid).toBeTruthy();
      expect(form.value.useDifferentPostcode).not.toBe('yes');
      expect(form.value.useDifferentPostcode).not.toBe('no');
    });
  });

  describe('Error message', async () => {
    it('should display an error message when not selecting anything', async () => {
      const { getByText, getByTestId } = await setup();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      const errorMessage = getByTestId('errorMessage');
      expect(errorMessage.innerText).toContain('Select yes if you want to try a different postcode');
    });
  });

  describe('Navigation', () => {
    it('should navigate to the find-workplace-address page when selecting yes', async () => {
      const { fixture, spy, getByText } = await setup();
      const yesRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration', 'find-workplace-address']);
    });

    it('should navigate to the workplace name and address page when selecting no', async () => {
      const { fixture, spy, getByText } = await setup();
      const noRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration', 'workplace-name-address']);
    });
  });

  describe('setBackLink()', () => {
    it('should set the correct back link when in the parent flow', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'find-workplace-address'],
      });
    });
  });
});
