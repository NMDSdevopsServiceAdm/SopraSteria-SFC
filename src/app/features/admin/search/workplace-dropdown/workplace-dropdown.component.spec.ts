import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationsService } from '@core/services/registrations.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkplaceDropdownComponent } from './workplace-dropdown.component';

describe('WorkplaceDropdownComponent', () => {
  async function setup() {
    const { fixture } = await render(WorkplaceDropdownComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([{ path: 'dashboard', component: DashboardComponent }]),
        HttpClientTestingModule,
      ],
      declarations: [WorkplaceDropdownComponent],
      providers: [
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        RegistrationsService,
        WindowRef,
        UserService,
      ],
      componentProperties: {
        item: {
          address1: '1 THE LANE',
          address2: '',
          county: 'HAMPSHIRE',
          dataOwner: 'Workplace',
          employerType: { value: 'Voluntary / Charity', other: null },
          isParent: false,
          isRegulated: false,
          lastUpdated: new Date('2021-11-26T12:36:12.047Z'),
          locationId: null,
          name: 'The One and Only',
          nmdsId: 'H1003112',
          parent: {
            uid: 'c1231-b13-40d3-4141-ad77f40f4629',
            nmdsId: 'A1234567',
          },
          postcode: 'ABC123',
          town: 'SOMEWHERE TOWN',
          uid: 'c93920e7-b373-40d3-8202-ad77f40f4629',
          users: [
            {
              isLocked: false,
              name: 'Bob Bobson',
              securityAnswer: 'Blue maybe',
              securityQuestion: 'What is your favourite colour?',
              uid: '60a22dd6-7fe0-4105-93f0-34946917768c',
              username: 'bobby',
            },
          ],
        },
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
    };
  }

  it('should render a WorkplaceDropdownComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
