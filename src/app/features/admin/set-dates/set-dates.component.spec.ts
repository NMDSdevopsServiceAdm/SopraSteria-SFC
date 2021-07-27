import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SetDatesComponent } from './set-dates.component';

describe('SetDatesComponent', () => {
  async function setup() {
    const component = await render(SetDatesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [LocalAuthoritiesReturnService],
    });

    return {
      component,
    };
  }

  it('should render a SetDatesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
