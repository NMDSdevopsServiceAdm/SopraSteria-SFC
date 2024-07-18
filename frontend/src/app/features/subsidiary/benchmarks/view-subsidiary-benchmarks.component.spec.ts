import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { BenchmarksSelectViewPanelComponent } from '@shared/components/benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ViewSubsidiaryBenchmarksComponent } from './view-subsidiary-benchmarks.component';

describe('ViewSubsidiaryBenchmarksComponent', () => {
  const setup = async (newDashboard = true) => {
    const establishment = establishmentBuilder() as Establishment;
    const tileData = {
      meta: {
        lastUpdated: new Date(),
        workplaces: 10,
        staff: 100,
        localAuthority: 'Test LA',
        workplacesGoodCqc: 19,
        staffGoodCqc: 660,
      },
    };
    const { fixture, getByText, getByTestId, queryByTestId } = await render(ViewSubsidiaryBenchmarksComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        WindowRef,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: BenchmarksServiceBase,
          useClass: MockBenchmarksService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { establishment },
            },
          },
        },
      ],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        newDashboard,
        tilesData: tileData,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('can see new data area', () => {
    it('should render the new data area tab component', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.canSeeNewDataArea = true;
      component.newDataAreaFlag = true;
      fixture.detectChanges();

      expect(queryByTestId('data-area-tab')).toBeTruthy();
    });
  });

  describe('can not see new data area', () => {
    it('should render the old benchmarks tab', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.canSeeNewDataArea = false;
      component.newDataAreaFlag = true;
      component.viewBenchmarksByCategory = true;
      fixture.detectChanges();

      expect(queryByTestId('old-benchmarks-tab')).toBeTruthy();
    });
  });
});
