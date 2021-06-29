import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CreateAccountComponent } from './create-account.component';

describe('CreateAccountComponent', () => {
  async function setup() {
    const { fixture } = await render(CreateAccountComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [RegistrationService],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
