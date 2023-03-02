import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { ViewWorkplaceComponent } from '@features/workplace/view-workplace/view-workplace.component';
import { TabComponent } from '@shared/components/tabs/tab.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { ViewMyWorkplacesComponent } from '../view-my-workplaces/view-my-workplaces.component';

describe('view-workplace', () => {
  async function setup(isAdmin = true, subsidiaries = 0) {
    const role = isAdmin ? Roles.Admin : Roles.Edit;
    const { fixture, getByTestId, getByText, queryByTestId, queryByText } = await render(ViewWorkplaceComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([
          { path: 'workplace/view-all-workplaces', component: ViewMyWorkplacesComponent },
        ]),
        HttpClientTestingModule,
      ],
      declarations: [TabComponent, HomeTabComponent],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory([], isAdmin),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, role),
          deps: [HttpClient],
        },
        {
          provide: NotificationsService,
          useClass: MockNotificationsService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: BenchmarksService,
          useClass: MockBenchmarksService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: WorkerService, useClass: MockWorkerService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workers: { workers: [], workerCount: 0, trainingCounts: {} },
              },
            },
            queryParams: of({ view: null }),
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;

    const benchmarksService = injector.inject(BenchmarksService) as BenchmarksService;
    const benchmarkUsageSpy = spyOn(benchmarksService, 'postBenchmarkTabUsage').and.callThrough();

    return {
      getByTestId,
      queryByTestId,
      queryByText,
      getByText,
      benchmarkUsageSpy,
      component,
      fixture,
      establishmentService,
      router,
    };
  }

  it('should render a view Workplace Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Tabs', () => {
    it('should display the Users tab', async () => {
      const { component, fixture, getByText } = await setup(true);

      const establishment = {
        ...component.workplace,
      };
      establishment.isRegulated = false;
      component.workplace = establishment;
      fixture.detectChanges();

      expect(getByText('Workplace users')).toBeTruthy();
    });

    it('should display a flag on the workplace tab when the sharing permisson banner is true', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.showSharingPermissionsBanner = true;
      fixture.detectChanges();

      expect(getByTestId('red-flag')).toBeTruthy();
    });
  });

  describe('Archive Workplace', () => {
    it('should display a Delete Workplace link if user is an admin', async () => {
      const { getByText } = await setup(true);

      expect(getByText('Delete Workplace')).toBeTruthy();
    });

    it('should not display a Delete Workplace link if user not an admin', async () => {
      const { queryByText } = await setup(false);

      expect(queryByText('Delete Workplace')).toBeNull();
    });

    it('should display a modal when the user clicks on Delete Workplace', async () => {
      const { getByText } = await setup(true);

      const deleteWorkplace = getByText('Delete Workplace');
      deleteWorkplace.click();

      const dialog = await within(document.body).findByRole('dialog');

      expect(within(dialog).getByText('Delete workplace')).toBeTruthy();
    });

    it('should send a DELETE request once the user confirms to Delete Workplace', async () => {
      const { establishmentService, getByText } = await setup(true);

      const spy = spyOn(establishmentService, 'deleteWorkplace').and.returnValue(of({}));

      const deleteWorkplace = getByText('Delete Workplace');
      deleteWorkplace.click();

      const dialog = await within(document.body).findByRole('dialog');
      const confirm = within(dialog).getByText('Delete workplace');
      confirm.click();

      expect(spy).toHaveBeenCalled();
    });

    it('should redirect the user after deleting a workplace', async () => {
      const { establishmentService, router, getByText } = await setup(true);

      spyOn(establishmentService, 'deleteWorkplace').and.returnValue(of({}));
      const spy = spyOn(router, 'navigate');
      spy.and.returnValue(Promise.resolve(true));

      const deleteWorkplace = getByText('Delete Workplace');
      deleteWorkplace.click();

      const dialog = await within(document.body).findByRole('dialog');
      const confirm = within(dialog).getByText('Delete workplace');
      confirm.click();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('tabClickEvent', () => {
    it('should call postBenchmarkTabUsage when benchmarks tab is clicked', async () => {
      const { getByTestId, component, fixture, benchmarkUsageSpy } = await setup();

      component.canViewBenchmarks = true;
      fixture.detectChanges();

      const benchmarksTab = getByTestId('tab_benchmarks');

      fireEvent.click(benchmarksTab);
      expect(benchmarkUsageSpy).toHaveBeenCalled();
    });

    it('should not call postBenchmarkTabUsage when the other dashboard tabs are clicked', async () => {
      const { getByTestId, component, fixture, benchmarkUsageSpy } = await setup();

      component.canViewBenchmarks = true;
      fixture.detectChanges();

      const workplaceTab = getByTestId('tab_workplace');
      const staffRecordsTab = getByTestId('tab_staff-records');
      const trainingAndQualificationsTab = getByTestId('tab_training-and-qualifications');

      fireEvent.click(workplaceTab);
      fireEvent.click(staffRecordsTab);
      fireEvent.click(trainingAndQualificationsTab);

      expect(benchmarkUsageSpy).not.toHaveBeenCalled();
    });
  });
});
