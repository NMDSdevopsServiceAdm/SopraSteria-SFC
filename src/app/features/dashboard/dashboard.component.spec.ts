import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('DashboardComponent', () => {
  async function setup(isAdmin = true, subsidiaries = 0) {
    const component = await render(DashboardComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([{ path: 'search-establishments', component: DashboardComponent }]),
        HttpClientTestingModule,
      ],
      declarations: [HomeTabComponent],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, isAdmin),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        { provide: WindowToken, useValue: MockWindow },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: WorkerService, useClass: MockWorkerService },
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    const router = injector.inject(Router) as Router;

    return {
      component,
      establishmentService,
      router,
    };
  }

  it('should render a DashboardComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Tabs', () => {
    it('should display the Benchmarks tab when canViewBenchmarks is true', async () => {
      const { component } = await setup(true);

      component.fixture.componentInstance.canViewBenchmarks = true;
      component.fixture.detectChanges();

      expect(component.getByTestId('tab_benchmarks')).toBeTruthy();
    });

    it('should not display the Benchmarks tab when canViewBenchmarks is false', async () => {
      const { component } = await setup(true);

      component.fixture.componentInstance.canViewBenchmarks = false;

      component.fixture.detectChanges();

      expect(component.queryByTestId('tab_benchmarks')).toBeNull();
    });

    it('should display the Users tab', async () => {
      const { component } = await setup(true);

      const establishment = {
        ...component.fixture.componentInstance.workplace,
      };
      establishment.isRegulated = false;
      component.fixture.componentInstance.canViewListOfUsers = true;
      component.fixture.componentInstance.workplace = establishment;
      component.fixture.detectChanges();

      expect(component.getByText('Users')).toBeTruthy();
    });

    it('should display a flag on the workplace tab when the sharing permissions banner flag is true', async () => {
      const { component } = await setup(true);

      component.fixture.componentInstance.canViewEstablishment = true;
      component.fixture.componentInstance.showSharingPermissionsBanner = true;
      component.fixture.detectChanges();

      expect(component.getByTestId('red-flag')).toBeTruthy();
    });
  });
});
