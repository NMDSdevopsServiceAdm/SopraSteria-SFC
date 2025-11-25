import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewDashboardComponent } from './dashboard.component';

describe('NewDashboardComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(NewDashboardComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: TabsService,
          useFactory: MockTabsService.factory(overrides.selectedTab),
        },
        {
          provide: BenchmarksV2Service,
          useClass: MockBenchmarksService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory({ primaryWorkplace: overrides.establishment }),
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(overrides.permissions ?? ([] as PermissionType[])),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workers: [],
              },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Home tab', () => {
    it('should show the home tab when the selected tab is the home tab', async () => {
      const { getByTestId } = await setup({ establishment: { isParent: false } });

      expect(getByTestId('home-tab')).toBeTruthy();
    });

    it('should show the parent home tab when the selected tab is the home tab and they are a parent', async () => {
      const { getByTestId } = await setup({ establishment: { isParent: true } });

      expect(getByTestId('parentHomeTab')).toBeTruthy();
    });
  });

  describe('Workplace tab', () => {
    it('should show the workplace tab when it is the selected tab, there is a workplace and there is canViewEstablishment permissions', async () => {
      const { getByTestId } = await setup({ selectedTab: 'workplace', permissions: ['canViewEstablishment'] });

      expect(getByTestId('workplace-tab')).toBeTruthy();
    });

    it('should not show the workplace tab if there are no canViewEstablishments permissions', async () => {
      const { queryByTestId } = await setup({ selectedTab: 'workplace' });

      expect(queryByTestId('workplace-tab')).toBeFalsy();
    });

    it('should not show the workplace tab if there is no workplace present', async () => {
      const { component, fixture, queryByTestId } = await setup({
        selectedTab: 'workplace',
        permissions: ['canViewEstablishment'],
      });

      component.workplace = null;
      fixture.detectChanges();

      expect(queryByTestId('workplace-tab')).toBeFalsy();
    });
  });

  describe('Staff-records tab', () => {
    it('should show the staff-records tab when it is the selected tab, there is a workplace and there is canViewListOfWorkers permissions', async () => {
      const { getByTestId } = await setup({ selectedTab: 'staff-records', permissions: ['canViewListOfWorkers'] });

      expect(getByTestId('staff-records-tab')).toBeTruthy();
    });

    it('should not show the staff-records tab if there are no canViewListOfWorkers permissions', async () => {
      const { queryByTestId } = await setup('staff-records');

      expect(queryByTestId('staf-records-tab')).toBeFalsy();
    });

    it('should not show the staff-records tab if there is no workplace present', async () => {
      const { component, fixture, queryByTestId } = await setup({
        selectedTab: 'workplace',
        permissions: ['canViewListOfWorkers'],
      });

      component.workplace = null;
      fixture.detectChanges();

      expect(queryByTestId('staff-records-tab')).toBeFalsy();
    });
  });

  describe('Training-and-qualifications tab', () => {
    it('should show the training-and-qualifications tab when it is the selected tab, there is a workplace and there is canViewListOfWorkers permissions', async () => {
      const { getByTestId } = await setup({
        selectedTab: 'training-and-qualifications',
        permissions: ['canViewListOfWorkers'],
      });

      expect(getByTestId('training-and-qualifications-tab')).toBeTruthy();
    });

    it('should not show the training-and-qualifications tab if there are no canViewListOfWorkers permissions', async () => {
      const { queryByTestId } = await setup('training-and-qualifications');

      expect(queryByTestId('training-and-qualifications-tab')).toBeFalsy();
    });

    it('should not show the training-and-qualifications tab if there is no workplace present', async () => {
      const { component, fixture, queryByTestId } = await setup({
        selectedTab: 'training-and-qualifications',
        permissions: ['canViewListOfWorkers'],
      });

      component.workplace = null;
      fixture.detectChanges();

      expect(queryByTestId('training-and-qualifications-tab')).toBeFalsy();
    });
  });

  describe('Benchmarks tab', () => {
    it('should show the benchmarks tab when it is the selected tab, there is a workplace and there is canViewListOfWorkers permissions', async () => {
      const { getByTestId } = await setup({ selectedTab: 'benchmarks' });

      expect(getByTestId('benchmarks-tab')).toBeTruthy();
    });

    [1, 2, 8].forEach((reportingID) => {
      it(`should render the new data area tab component when reporting ID is ${reportingID}`, async () => {
        const { queryByTestId } = await setup({
          selectedTab: 'benchmarks',
          establishment: { mainService: { id: 24, name: 'Care home services with nursing', reportingID } },
        });

        expect(queryByTestId('data-area-tab')).toBeTruthy();
      });
    });

    it('should render the old benchmarks tab when other reporting ID', async () => {
      const { queryByTestId } = await setup({
        selectedTab: 'benchmarks',
        establishment: { mainService: { id: 11, name: 'Domestic services and home help', reportingID: 10 } },
      });

      expect(queryByTestId('benchmarks-tab')).toBeTruthy();
    });
  });
});