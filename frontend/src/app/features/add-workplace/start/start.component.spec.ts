import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, RouterModule } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StartComponent } from './start.component';

describe('StartComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(StartComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        BackLinkService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to regulated-by-cqc url in add-workplace flow when Continue button clicked', async () => {
    const { getByText } = await setup();

    const continueButton = getByText('Continue');

    expect(continueButton.getAttribute('href')).toBe('/add-workplace/regulated-by-cqc');
  });
});
