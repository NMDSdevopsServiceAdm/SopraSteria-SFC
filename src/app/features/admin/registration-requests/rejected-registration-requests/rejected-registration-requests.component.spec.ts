import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RejectedRegistrationRequestsComponent } from './rejected-registration-requests.component';

describe('RejectedRegistrationRequestsComponent', () => {
  async function setup() {
    const component = await render(RejectedRegistrationRequestsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: SwitchWorkplaceService, useClass: MockSwitchWorkplaceService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                registrations: [
                  {
                    name: 'Workplace 1',
                    postcode: 'PO5 3CO',
                    parentEstablishmentId: null,
                    workplaceUid: 'someuid',
                    status: 'REJECTED',
                    created: new Date('01/01/2021'),
                    updated: new Date('01/02/2021'),
                  },
                  {
                    name: 'Workplace 2',
                    postcode: 'AS4 8DS',
                    parentEstablishmentId: null,
                    workplaceUid: 'anotheruid',
                    status: 'REJECTED',
                    created: new Date('02/01/2021'),
                    updated: new Date('02/02/2021'),
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const fixture = component.fixture;

    return {
      component,
      fixture,
    };
  }

  it('should render a RejectedRegistrationRequestsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the rejected registrations when first loading page', async () => {
    const { component } = await setup();

    const workplace1Name = component.queryByText('Workplace 1');
    const workplace1Updated = component.queryByText('02 Jan 2021');

    const workplace2Name = component.queryByText('Workplace 2');
    const workplace2Updated = component.queryByText('02 Feb 2021');

    expect(workplace1Name).toBeTruthy();
    expect(workplace1Updated).toBeTruthy();
    expect(workplace2Name).toBeTruthy();
    expect(workplace2Updated).toBeTruthy();
  });
});
