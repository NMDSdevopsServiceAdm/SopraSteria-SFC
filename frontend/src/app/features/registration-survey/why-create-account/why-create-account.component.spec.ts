import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationSurveyModule } from '../registration-survey.module';
import { WhyCreateAccountComponent } from './why-create-account.component';

describe('WhyCreateAccountComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(WhyCreateAccountComponent, {
      imports: [SharedModule, RegistrationSurveyModule, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();

    const registrationSurveyService = injector.inject(RegistrationSurveyService);
    const registrationSurveyServiceSpy = spyOn(registrationSurveyService, 'updatewhyCreateAccountState');

    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate');

    return { fixture, component, getByText, registrationSurveyServiceSpy, routerSpy };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the why create account question', async () => {
    const { fixture } = await setup();
    const text = fixture.nativeElement.querySelector('h1');
    expect(text.innerText).toContain('Why did you create an account?');
  });

  it('should check a selected checkbox', async () => {
    const { fixture } = await setup();

    const checkbox = fixture.nativeElement.querySelector(`input[name="whyCreateAccount-0"]`);
    fireEvent.click(checkbox);

    expect(checkbox.checked).toBeTruthy;
    expect(checkbox.value).toEqual(
      'To help the Department of Health and Social Care and others to better understand the adult social care sector',
    );
  });

  it('should call updatewhyCreateAccountState in registration service with selected checkboxes on submit', async () => {
    const { getByText, registrationSurveyServiceSpy } = await setup();

    const benefitsCheckboxText = 'To get access to the Benefits Bundle';
    const manageStaffRecordsText = 'To record and manage staff records';

    fireEvent.click(getByText(benefitsCheckboxText));
    fireEvent.click(getByText(manageStaffRecordsText));

    const nextQuestionButton = getByText('Next question');
    fireEvent.click(nextQuestionButton);

    expect(registrationSurveyServiceSpy).toHaveBeenCalledWith([benefitsCheckboxText, manageStaffRecordsText]);
  });

  it('should call updatewhyCreateAccountState in registration service with empty array when no checkboxes selected', async () => {
    const { getByText, registrationSurveyServiceSpy } = await setup();

    const nextQuestionButton = getByText('Next question');
    fireEvent.click(nextQuestionButton);

    expect(registrationSurveyServiceSpy).toHaveBeenCalledWith([]);
  });

  it('should navigate to the next question', async () => {
    const { getByText, routerSpy } = await setup();

    const nextQuestionButton = getByText('Next question');
    fireEvent.click(nextQuestionButton);

    expect(routerSpy).toHaveBeenCalledWith(['/registration-survey', 'how-did-you-hear-about']);
  });
});