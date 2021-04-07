import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationSurveyModule } from '../registration-survey.module';
import { HowDidYouHearAboutComponent } from './how-did-you-hear-about.component';

fdescribe('HowDidYouHearAboutComponent', () => {
  async function setup() {
    return render(HowDidYouHearAboutComponent, {
      imports: [SharedModule, RegistrationSurveyModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: RegistrationSurveyService,
          useClass: RegistrationSurveyService,
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

    const checkbox = component.fixture.nativeElement.querySelector(`input[name="howDidYouHearAbout-6"]`);
    fireEvent.click(checkbox);

    expect(checkbox.checked).toBeTruthy;
    expect(checkbox.value).toEqual('Other');
  });

  it('should navigate to the thank you page', async () => {
    const component = await setup();

    const nextPage = component.fixture.componentInstance.nextPage;
    expect(nextPage.url).toEqual(['/registration-survey', 'thank-you']);
  });
});
