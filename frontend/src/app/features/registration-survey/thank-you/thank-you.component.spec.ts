import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RegistrationSurveyModule } from '../registration-survey.module';
import { ThankYouComponent } from './thank-you.component';
import { provideRouter, RouterModule } from '@angular/router';

describe('ThankYouComponent', () => {
  async function setup() {
    return render(ThankYouComponent, {
      imports: [SharedModule, RouterModule, RegistrationSurveyModule],
      providers: [
        {
          provide: RegistrationSurveyService,
          useClass: RegistrationSurveyService,
          deps: [HttpClient],
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the thank you message', async () => {
    const component = await setup();
    const text = component.fixture.nativeElement.querySelector('h1');
    expect(text.innerText).toContain('Thank you, we really appreciate your help');
  });

  it('should navigate to the first login wizard', async () => {
    const component = await setup();

    const nextPage = component.fixture.componentInstance.nextPage;
    expect(nextPage.url).toEqual(['/dashboard']);
  });
});
