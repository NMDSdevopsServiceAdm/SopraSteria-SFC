//how-do-you-pay-for-sleep-ins.component.

import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { HowDoYouPayForSleepInsComponent } from './how-do-you-pay-for-sleep-ins.component';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WindowRef } from '@core/services/window.ref';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { patchRouterUrlForWorkplaceQuestions } from '@core/test-utils/patchUrlForWorkplaceQuestions';

fdescribe('HowDoYouPayForSleepInsComponent', () => {
  async function setup(overrides: any = {}) {
    const isInAddDetailsFlow = !overrides.returnToUrl;

    const setupTools = await render(HowDoYouPayForSleepInsComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        patchRouterUrlForWorkplaceQuestions(isInAddDetailsFlow),
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  }

  it('should render HowDoYouPayForSleepInsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
