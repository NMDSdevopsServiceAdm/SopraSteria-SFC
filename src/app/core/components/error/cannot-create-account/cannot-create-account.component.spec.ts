import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CannotCreateAccountComponent } from './cannot-create-account.component';

describe('CannotCreateAccountComponent', () => {
  async function setup() {
    const { fixture } = await render(CannotCreateAccountComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [BackService],
    });

    const component = fixture.componentInstance;

    return { component };
  }

  it('should render the CannotCreateAccountComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
