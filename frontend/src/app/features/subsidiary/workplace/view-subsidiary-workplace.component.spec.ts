import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { ViewSubsidiaryWorkplaceComponent } from './view-subsidiary-workplace.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { NewDashboardHeaderComponent } from '@shared/components/new-dashboard-header/dashboard-header.component';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { EstablishmentService } from '@core/services/establishment.service';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { MockUserService } from '@core/test-utils/MockUserService';
import { Roles } from '@core/model/roles.enum';

describe('ViewSubsidiaryWorkplaceComponent', () => {
  const setup = async (override: any = { isAdmin: true }) => {
    const setupTools = await render(ViewSubsidiaryWorkplaceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canViewEstablishment', 'canViewListOfWorkers']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, Roles.Admin),
          deps: [HttpClient],
        },

        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, override.isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: Establishment,
              },
            },
          },
        },
      ],
      declarations: [NewDashboardHeaderComponent],
    });
    const component = setupTools.fixture.componentInstance;

    return { component, ...setupTools };
  };

  it('should render a View Subsidiary Workplace Component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the dashboard header', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('dashboard-header')).toBeTruthy();
  });
});
