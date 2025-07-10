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
  const setup = async (overrides: any = {}) => {
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
              data: { establishment: { ...(establishmentBuilder() as Establishment), ...overrides.establishment } },
            },
          },
        },
      ],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
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

  describe('Displaying correct version of tab', () => {
    [1, 2, 8].forEach((reportingID) => {
      it(`should render the new data area tab component when reporting ID is ${reportingID}`, async () => {
        const { queryByTestId } = await setup({
          establishment: { mainService: { id: 24, name: 'Care home services with nursing', reportingID } },
        });

        expect(queryByTestId('data-area-tab')).toBeTruthy();
      });
    });

    it('should render the old benchmarks tab when other reporting ID', async () => {
      const { queryByTestId } = await setup({
        establishment: { mainService: { id: 11, name: 'Domestic services and home help', reportingID: 10 } },
      });

      expect(queryByTestId('old-benchmarks-tab')).toBeTruthy();
    });
  });
});
