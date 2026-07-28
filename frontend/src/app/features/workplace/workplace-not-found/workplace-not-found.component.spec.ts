import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { provideRouter, RouterModule } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkplaceNotFoundComponent } from './workplace-not-found.component';

describe('WorkplaceNotFoundComponent', () => {
  const workplaceUid = 'abc131355543435';

  async function setup() {
    const backLinkServiceSpy = jasmine.createSpyObj('BacklinkService', ['showBackLink']);

    const { fixture, getByText } = await render(WorkplaceNotFoundComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useValue: {
            establishment: { uid: workplaceUid },
          },
        },
        {
          provide: BackLinkService,
          useValue: backLinkServiceSpy,
        },
        LocationService,
        provideRouter([
          {
            path: `workplace/${workplaceUid}/workplace-data/workplace-summary/workplace-not-found`,
            component: WorkplaceNotFoundComponent,
          },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    await RouterTestingHarness.create(`workplace/${workplaceUid}/workplace-data/workplace-summary/workplace-not-found`);

    const component = fixture.componentInstance;

    return {
      backLinkServiceSpy,
      component,
      fixture,
      getByText,
    };
  }

  it('should render a WorkplaceNotFoundComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a go back link to regulated-by-cqc page', async () => {
    const { getByText } = await setup();

    const link = getByText('go back and try again');

    expect(link.getAttribute('href')).toContain('regulated-by-cqc');
  });

  it('should set the back link to regulated-by-cqc page', async () => {
    const { backLinkServiceSpy } = await setup();

    expect(backLinkServiceSpy.showBackLink).toHaveBeenCalled();
  });
});
