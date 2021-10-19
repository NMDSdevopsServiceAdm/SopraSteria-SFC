import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CreateAccountComponent } from './create-account.component';

describe('CreateAccountComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(CreateAccountComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: RegistrationService,
          useClass: RegistrationService,
          deps: [HttpClient],
        },
      ],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to regulated by CQC page when Start now button is clicked', async () => {
    const { getByText } = await setup();
    const startNowButton = getByText('Start now');
    expect(startNowButton.getAttribute('href')).toBe('/registration/regulated-by-cqc');
  });

  it('should navigate to About ASC-WDS page when view our about ASC-WDS link is clicked', async () => {
    const { getByText } = await setup();
    const startNowButton = getByText(`view our 'about ASC-WDS'`);
    expect(startNowButton.getAttribute('href')).toBe('/registration/about-ascwds');
  });

  it('should open Skills for Care website when Read about benefits link is clicked', async () => {
    const { getByText } = await setup();
    const cancelButton = getByText('read about the benefits of having an ASC-WDS account');
    expect(cancelButton.getAttribute('href')).toBe(
      'https://www.skillsforcare.org.uk/adult-social-care-workforce-data/ASC-WDS/Discover-the-Adult-Social-Care-Workforce-Data-Set.aspx',
    );
  });

  it('should navigate to login page when Already have an account? Sign in link is clicked', async () => {
    const { getByText } = await setup();
    const cancelButton = getByText('Already have an account? Sign in');
    expect(cancelButton.getAttribute('href')).toBe('/login');
  });
});
