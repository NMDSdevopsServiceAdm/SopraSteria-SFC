import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationsService } from '@core/services/registrations.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { buildMockAdminSearchWorkplace } from '@core/test-utils/admin/MockSearchService';
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
        item: buildMockAdminSearchWorkplace(),
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
