import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentServiceCheckCQCDetails } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { NewDashboardHeaderComponent } from '@shared/components/new-dashboard-header/dashboard-header.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { ViewSubsidiaryWorkplaceComponent } from './view-subsidiary-workplace.component';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('ViewSubsidiaryWorkplaceComponent', () => {
  const setup = async (overrides: any = {}) => {
    const role = Roles.Edit;
    const setupTools = await render(ViewSubsidiaryWorkplaceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(
            overrides.permissions ?? (['canEditEstablishment'] as PermissionType[]),
          ),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceCheckCQCDetails.factory(),
          deps: [HttpClient],
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },

        {
          provide: UserService,
          useFactory: MockUserService.factory(0, role),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, false),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                cqcStatusCheck: { cqcStatusMatch: overrides.cqcStatusMatch ?? false },
                establishment: overrides.establishment ?? Establishment,
              },
            },
          },
        },
        { provide: WindowToken, useValue: MockWindow },
      provideHttpClient(), provideHttpClientTesting(),],
      declarations: [NewDashboardHeaderComponent],
    });

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the dashboard header', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('dashboard-header')).toBeTruthy();
  });

  describe('banners', () => {
    it('should show the add more details banner with correct href when the showAddWorkplaceDetailsBanner is true and have the correct permissions', async () => {
      const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };
      const { getByText } = await setup({ establishment });

      const banner = getByText('Start to add more details about your workplace');

      expect(banner).toBeTruthy();
      expect(banner.getAttribute('href')).toEqual(`/workplace/${establishment.uid}/start`);
    });

    it('should not show the add more details banner when the showAddWorkplaceDetailsBanner is false', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Start to add more details about your workplace')).toBeFalsy();
    });

    it('should not show the add more details banner when there are not the correct permissions', async () => {
      const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };
      const { queryByText } = await setup({ permissions: [], establishment });

      expect(queryByText('Start to add more details about your workplace')).toBeFalsy();
    });

    it('should show the check cqc details banner when cqcStatusMatch is false in route data', async () => {
      const { getByTestId } = await setup({ cqcStatusMatch: false });

      expect(getByTestId('check-cqc-details-banner')).toBeTruthy();
    });

    it('should not show the check cqc details banner when cqcStatusMatch is true in route data', async () => {
      const { queryByTestId } = await setup({ cqcStatusMatch: true });

      expect(queryByTestId('check-cqc-details-banner')).toBeFalsy();
    });

    it('should not show the check cqc details banner when there are not the correct permissions', async () => {
      const { queryByTestId } = await setup({ permissions: [], cqcStatusMatch: true });

      expect(queryByTestId('check-cqc-details-banner')).toBeFalsy();
    });
  });
});