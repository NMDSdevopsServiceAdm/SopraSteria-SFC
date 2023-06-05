import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { MockRegistrationSurveyService } from '@core/test-utils/MockRegistrationSurveyService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationSurveyModule } from '../registration-survey.module';
import { ThankYouComponent } from '../thank-you/thank-you.component';
import { HowDidYouHearAboutComponent } from './how-did-you-hear-about.component';

describe('HowDidYouHearAboutComponent', () => {
  async function setup() {
    return render(HowDidYouHearAboutComponent, {
      imports: [
        SharedModule,
        RegistrationSurveyModule,
        RouterTestingModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          {
            path: 'registration-survey/thank-you',
            component: ThankYouComponent,
          },
        ]),
      ],
      providers: [
        {
          provide: RegistrationSurveyService,
          useClass: MockRegistrationSurveyService,
          deps: [HttpClient],
        },
      ],
    });
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the why create account question', async () => {
    const component = await setup();
    const text = component.fixture.nativeElement.querySelector('h1');
    expect(text.innerText).toContain('How did you hear about the Adult Social Care Workforce Data Set service?');
  });

  it('should check the Other checkbox', async () => {
    const component = await setup();

    const checkbox = component.fixture.nativeElement.querySelector(`input[name="howDidYouHearAbout-8"]`);
    fireEvent.click(checkbox);

    expect(checkbox.checked).toBeTruthy();
    expect(checkbox.value).toEqual('Other');
  });

  it('should navigate to the thank you page', async () => {
    const component = await setup();

    const nextPage = component.fixture.componentInstance.nextPage;
    expect(nextPage.url).toEqual(['/registration-survey', 'thank-you']);
  });

  describe('Submit Survey', async () => {
    it('should send off answers when survey is submitted', async () => {
      const expectedRequestBody = {
        whyDidYouCreateAccount: ['Other'],
        howDidYouHearAboutASCWDS: ['From an event we attended', 'From a Skills for Care staff member'],
      };
      MockRegistrationSurveyService.prototype.updatewhyCreateAccountState(['Other']);
      MockRegistrationSurveyService.prototype.updateHowDidYouHearAboutState([
        'From an event we attended',
        'From a Skills for Care staff member',
      ]);

      const component = await setup();
      const submit = component.getByRole('button');
      fireEvent.click(submit);
      const req = TestBed.inject(HttpTestingController).expectOne('/api/registrationSurvey');
      req.flush({});
      expect(req.request.body).toEqual(expectedRequestBody);
    });
  });
});
