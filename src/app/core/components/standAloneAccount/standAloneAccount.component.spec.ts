import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StandAloneAccountComponent } from './standAloneAccount.component';

describe('StandAloneAccountComponent', () => {
  const homeTab = { title: 'Home', slug: 'home', active: true };
  const workplaceTab = { title: 'Workplace', slug: 'workplace', active: false };
  const staffRecordsTab = { title: 'Staff records', slug: 'staff-records', active: false };
  const tAndQTab = { title: 'Training and qualifications', slug: 'training-and-qualifications', active: false };
  const benchmarksTab = { title: 'Benchmarks', slug: 'benchmarks', active: false };

  const setup = async (
    dashboardView = true,
    permissions = ['canViewBenchmarks', 'canViewListOfUsers', 'canViewListOfWorkers', 'canViewEstablishment'],
  ) => {
    const { fixture, getByTestId, queryByTestId, getByRole } = await render(StandAloneAccountComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        WindowRef,
        BenchmarksService,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        dashboardView,
      },
    });

    const component = fixture.componentInstance;

    const benchmarksService = TestBed.inject(BenchmarksService);
    const benchmarksSpy = spyOn(benchmarksService, 'postBenchmarkTabUsage').and.callThrough();

    return {
      component,
      fixture,
      getByTestId,
      queryByTestId,
      getByRole,
      benchmarksSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the app-header if dashboardView is true and conditional class on main component', async () => {
    const { getByTestId, getByRole } = await setup();

    expect(getByTestId('dashboard-header')).toBeTruthy();
    expect(getByRole('main').getAttribute('class')).toContain('govuk-!-padding-top-0');
  });

  it('should not show the app-header if dashboardView is false and conditional class should not be on main component', async () => {
    const { queryByTestId, getByRole } = await setup(false);

    expect(queryByTestId('dashboard-header')).toBeFalsy();
    expect(getByRole('main').getAttribute('class')).not.toContain('govuk-!-padding-top-0');
  });

  describe('Tabs', () => {
    it('should show all tabs when all permissions are on the establishment', async () => {
      const { component } = await setup();

      expect(component.tabs).toEqual([homeTab, workplaceTab, staffRecordsTab, tAndQTab, benchmarksTab]);
    });

    it('should show not show the workplace tab when canViewEstablisment permission is not on the establishment', async () => {
      const permissions = ['canViewBenchmarks', 'canViewListOfUsers', 'canViewListOfWorkers'];
      const { component } = await setup(true, permissions);

      expect(component.tabs).toEqual([homeTab, staffRecordsTab, tAndQTab, benchmarksTab]);
    });

    it('should show not show the staff-records or tAndQ tabs when canViewListOfWorkers permission is not on the establishment', async () => {
      const permissions = ['canViewBenchmarks', 'canViewListOfUsers', 'canViewEstablishment'];
      const { component } = await setup(true, permissions);

      expect(component.tabs).toEqual([homeTab, workplaceTab, benchmarksTab]);
    });
  });

  describe('tabClickEvent', () => {
    it('should run postBenchmarkTabUsage when called with a tab slug of benchmarks', async () => {
      const { component, benchmarksSpy } = await setup();
      const workplaceId = component.workplaceId;
      component.tabClickEvent({ tabSlug: 'benchmarks' });
      expect(benchmarksSpy).toHaveBeenCalledWith(workplaceId);
    });

    it('should not run postBenchmarkTabUsage when called with a tab slug that is not benchmarks', async () => {
      const { component, benchmarksSpy } = await setup();

      component.tabClickEvent({ tabSlug: 'home' });
      expect(benchmarksSpy).not.toHaveBeenCalled();
    });
  });
});
