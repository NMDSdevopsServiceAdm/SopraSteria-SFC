import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { EditUser, MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { TabComponent } from '@shared/components/tabs/tab.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('DashboardComponent', () => {
  async function setup(oneUser = false, totalStaffRecords = 2, showBanner = false) {
    showBanner ? history.pushState({ showBanner: true }, '') : history.pushState({ showBanner: false }, '');

    const { fixture, getByText, getByTestId, queryByTestId } = await render(DashboardComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([{ path: 'search-establishments', component: DashboardComponent }]),
        HttpClientTestingModule,
      ],
      declarations: [HomeTabComponent, TabComponent],
      providers: [
        AlertService,
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory([
            'canViewListOfWorkers',
            'canViewEstablishment',
            'canViewListOfUsers',
            'canAddUser',
          ]),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, true),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        { provide: WindowToken, useValue: MockWindow },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: WorkerService, useClass: MockWorkerService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                users: oneUser ? ([EditUser()] as UserDetails[]) : ([EditUser(), EditUser()] as UserDetails[]),
                articleList: null,
                workers: [],
                totalStaffRecords,
              },
            },
            queryParams: of({ view: null }),
            url: of(null),
          },
        },
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    const router = injector.inject(Router) as Router;

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
      establishmentService,
      router,
      alertSpy,
    };
  }

  it('should render a DashboardComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Tabs', () => {
    it('should display the Home tab', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('tab_home')).toBeTruthy();
    });

    it('should display the Workplace tab', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('tab_workplace')).toBeTruthy();
    });

    it('should display the Staff Record tab', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('tab_staff-records')).toBeTruthy();
    });

    it('should display the Training and Qualifications tab', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('tab_training-and-qualifications')).toBeTruthy();
    });

    it('should display the WDF tab', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.ngOnInit();
      fixture.detectChanges();

      expect(getByTestId('tab_wdf')).toBeTruthy();
    });

    it('should display the Benchmarks tab when canViewBenchmarks is true', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.canViewBenchmarks = true;
      fixture.detectChanges();

      expect(getByTestId('tab_benchmarks')).toBeTruthy();
    });

    it('should not display the Benchmarks tab when canViewBenchmarks is false', async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.canViewBenchmarks = false;

      fixture.detectChanges();

      expect(queryByTestId('tab_benchmarks')).toBeNull();
    });

    it('should display the Users tab', async () => {
      const { component, fixture, getByText } = await setup();

      const establishment = {
        ...component.workplace,
      };
      establishment.isRegulated = false;
      component.workplace = establishment;
      component.wdfNewDesignFlag = false;
      fixture.detectChanges();

      expect(getByText('Users')).toBeTruthy();
    });

    it('should display a flag on the workplace tab when the sharing permissions banner flag is true', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.showSharingPermissionsBanner = true;
      fixture.detectChanges();

      expect(getByTestId('red-flag')).toBeTruthy();
    });

    describe('Users tab warning', () => {
      it('should not display an orange flag on the Users tab when more than one user', async () => {
        const { queryByTestId } = await setup(false);

        expect(queryByTestId('orange-flag')).toBeFalsy();
      });

      it('should display an orange flag on the Users tab when only one user', async () => {
        const { queryByTestId } = await setup(true);

        expect(queryByTestId('orange-flag')).toBeTruthy();
      });
    });

    describe('Staff records tab warning', () => {
      it('should not display an orange flag on the Staff records tab when not 0 staff records', async () => {
        const totalStaffRecords = 3;
        const { queryByTestId } = await setup(false, totalStaffRecords);

        expect(queryByTestId('orange-flag')).toBeFalsy();
      });

      it('should display an orange flag on the Staff records tab when no staff', async () => {
        const totalStaffRecords = 0;
        const { queryByTestId } = await setup(false, totalStaffRecords);

        expect(queryByTestId('orange-flag')).toBeTruthy();
      });
    });

    describe('showStaffRecordBanner', () => {
      it('should not show a banner if the show banner flag is false', async () => {
        const { component, fixture, alertSpy } = await setup();

        component.ngOnInit();
        fixture.detectChanges();

        expect(alertSpy).not.toHaveBeenCalled();
      });

      it('should show a banner when a staff record has been confirmed', async () => {
        const { component, fixture, alertSpy } = await setup(false, 2, true);

        component.ngOnInit();
        fixture.detectChanges();

        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: `You've confirmed the details of the staff record you added`,
        });
      });
    });
  });
});
