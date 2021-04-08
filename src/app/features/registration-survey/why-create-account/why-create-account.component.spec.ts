import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationSurveyModule } from '../registration-survey.module';
import { WhyCreateAccountComponent } from './why-create-account.component';

describe('WhyCreateAccountComponent', () => {
  async function setup() {
    return render(WhyCreateAccountComponent, {
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
    expect(text.innerText).toContain('Why did you create an account?');
  });

  it('should check a selected checkbox', async () => {
    const component = await setup();

    const checkbox = component.fixture.nativeElement.querySelector(`input[name="whyCreateAccount-0"]`);
    fireEvent.click(checkbox);

    expect(checkbox.checked).toBeTruthy;
    expect(checkbox.value).toEqual(
      'To help the Department of Health and Social Care and others to better understand the adult social care sector',
    );
  });

  it('should navigate to the next question', async () => {
    const component = await setup();

    const nextPage = component.fixture.componentInstance.nextPage;
    expect(nextPage.url).toEqual(['/registration-survey', 'how-did-you-hear-about']);
  });
});
