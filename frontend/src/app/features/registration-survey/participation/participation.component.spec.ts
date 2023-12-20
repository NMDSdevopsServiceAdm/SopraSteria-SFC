import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationSurveyModule } from '../registration-survey.module';
import { ParticipationComponent } from './participation.component';

describe('ParticipationComponent', () => {
  async function setup() {
    return render(ParticipationComponent, {
      imports: [SharedModule, RegistrationSurveyModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: RegistrationSurveyService,
          useClass: RegistrationSurveyService,
          deps: [HttpClient],
        },
        {
          provide: UserService,
          useClass: MockUserService,
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the participation question', async () => {
    const component = await setup();
    const text = component.fixture.nativeElement.querySelector('h2');
    expect(text.innerText).toContain('Please could you answer 2 questions about why you created an account?');
  });

  it('should navigate to next question when selecting yes', async () => {
    const component = await setup();
    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="Yes"]`);
    fireEvent.click(yesRadioButton);

    const nextPage = component.fixture.componentInstance.nextPage;
    expect(nextPage.url).toEqual(['/registration-survey', 'why-create-account']);
  });

  it('should navigate to the first login wizard when selecting no', async () => {
    const component = await setup();
    const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="No"]`);
    fireEvent.click(noRadioButton);

    const nextPage = component.fixture.componentInstance.nextPage;
    expect(nextPage.url).toEqual(['/first-login-wizard']);
  });

  it('should navigate to the first login wizard when not selecting anything', async () => {
    const component = await setup();

    const nextPage = component.fixture.componentInstance.nextPage;
    expect(nextPage.url).toEqual(['/first-login-wizard']);
  });
});
