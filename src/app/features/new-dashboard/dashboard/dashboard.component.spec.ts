import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewDashboardComponent } from './dashboard.component';

describe('NewDashboardComponent', () => {
  const setup = async (tab = 'home', permissions = []) => {
    const { fixture, getByTestId, queryByTestId } = await render(NewDashboardComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: TabsService,
          useFactory: MockTabsService.factory(tab),
        },
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByTestId,
      queryByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Home tab', () => {
    it('should show the home tab when the selected tab is the home tab', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('home-tab')).toBeTruthy();
    });
  });

  describe('Workplace tab', () => {
    it('should show the workplace tab when it is the selected tab, there is a workplace and there is canViewEstablishment permissions', async () => {
      const { getByTestId } = await setup('workplace', ['canViewEstablishment']);

      expect(getByTestId('workplace-tab')).toBeTruthy();
    });

    it('should not show the workplace tab if there are no canViewEstablishments permissions', async () => {
      const { queryByTestId } = await setup('workplace');

      expect(queryByTestId('workplace-tab')).toBeFalsy();
    });

    it('should not show the workplace tab if there is no workplace present', async () => {
      const { component, fixture, queryByTestId } = await setup('workplace', ['canViewEstablishment']);

      component.workplace = null;
      fixture.detectChanges();

      expect(queryByTestId('workplace-tab')).toBeFalsy();
    });
  });

  describe('Staff-records tab', () => {
    it('should show the staff-records tab when it is the selected tab, there is a workplace and there is canViewListOfWorkers permissions', async () => {
      const { getByTestId } = await setup('staff-records', ['canViewListOfWorkers']);

      expect(getByTestId('staff-records-tab')).toBeTruthy();
    });

    it('should not show the staff-records tab if there are no canViewListOfWorkers permissions', async () => {
      const { queryByTestId } = await setup('staff-records');

      expect(queryByTestId('staf-records-tab')).toBeFalsy();
    });

    it('should not show the staff-records tab if there is no workplace present', async () => {
      const { component, fixture, queryByTestId } = await setup('workplace', ['canViewListOfWorkers']);

      component.workplace = null;
      fixture.detectChanges();

      expect(queryByTestId('staff-records-tab')).toBeFalsy();
    });
  });

  describe('Training-and-qualifications tab', () => {
    it('should show the training-and-qualifications tab when it is the selected tab, there is a workplace and there is canViewListOfWorkers permissions', async () => {
      const { getByTestId } = await setup('training-and-qualifications', ['canViewListOfWorkers']);

      expect(getByTestId('training-and-qualifications-tab')).toBeTruthy();
    });

    it('should not show the training-and-qualifications tab if there are no canViewListOfWorkers permissions', async () => {
      const { queryByTestId } = await setup('training-and-qualifications');

      expect(queryByTestId('training-and-qualifications-tab')).toBeFalsy();
    });

    it('should not show the training-and-qualifications tab if there is no workplace present', async () => {
      const { component, fixture, queryByTestId } = await setup('training-and-qualifications', [
        'canViewListOfWorkers',
      ]);

      component.workplace = null;
      fixture.detectChanges();

      expect(queryByTestId('training-and-qualifications-tab')).toBeFalsy();
    });
  });

  describe('Benchmarks tab', () => {
    it('should show the benchmarks tab when it is the selected tab, there is a workplace and there is canViewListOfWorkers permissions', async () => {
      const { getByTestId } = await setup('benchmarks');

      expect(getByTestId('benchmarks-tab')).toBeTruthy();
    });
  });
});
