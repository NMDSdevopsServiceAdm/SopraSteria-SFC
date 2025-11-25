import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
    const setupTools = await render(ParticipationComponent, {
      imports: [SharedModule, RegistrationSurveyModule],
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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;
    return { ...setupTools, component };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the participation question', async () => {
    const { getByRole } = await setup();
    const text = getByRole('heading', { level: 2 });
    expect(text.innerText).toContain('Please could you answer 2 questions about why you created an account?');
  });

  it('should navigate to next question when selecting yes', async () => {
    const { getByRole, component } = await setup();
    const yesRadioButton = getByRole('radio', { name: "Yes, I'll answer the questions" });
    fireEvent.click(yesRadioButton);

    const nextPage = component.nextPage;
    expect(nextPage.url).toEqual(['/registration-survey', 'why-create-account']);
  });

  it('should navigate to the dashboard when selecting no', async () => {
    const { component, getByRole } = await setup();
    const noRadioButton = getByRole('radio', { name: 'No, I want to start adding data' });
    fireEvent.click(noRadioButton);

    const nextPage = component.nextPage;
    expect(nextPage.url).toEqual(['/dashboard']);
  });

  it('should navigate to the dashboard when not selecting anything', async () => {
    const { component } = await setup();

    const nextPage = component.nextPage;
    expect(nextPage.url).toEqual(['/dashboard']);
  });
});
