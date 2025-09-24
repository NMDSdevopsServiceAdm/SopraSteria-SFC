import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { ViewSubsidiaryWorkplaceUsersComponent } from './view-subsidiary-workplace-users.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { NewDashboardHeaderComponent } from '@shared/components/new-dashboard-header/dashboard-header.component';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { EstablishmentService } from '@core/services/establishment.service';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { DialogService } from '@core/services/dialog.service';

describe('ViewSubsidiaryWorkplaceUsersComponent', () => {
  const setup = async (isAdmin = true, establishment = Establishment) => {
    const { fixture } = await render(ViewSubsidiaryWorkplaceUsersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        AlertService,
        WindowRef,
        DialogService,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canAddUser', 'canViewUser']),
          deps: [HttpClient, Router, UserService],
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
          useFactory: MockAuthService.factory(true, isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: establishment,
              },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
      declarations: [NewDashboardHeaderComponent],
    });
    const component = fixture.componentInstance;

    return { component, fixture };
  };

  it('should render a View Subsidiary Workplace Users Component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });
});