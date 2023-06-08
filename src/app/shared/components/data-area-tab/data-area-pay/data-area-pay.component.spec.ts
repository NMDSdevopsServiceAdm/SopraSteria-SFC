import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../../server/test/factories/models';
import { DataAreaPayComponent } from './data-area-pay.component';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';

describe('DataAreaTabComponent', () => {
  const setup = async () => {
    const establishment = establishmentBuilder() as Establishment;

    const { fixture, getByText, queryByText, getByTestId } = await render(DataAreaPayComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
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
          provide: BenchmarksService,
          useClass: MockBenchmarksService,
        },
      ],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        workplace: establishment,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByText,
      queryByText,
      getByTestId,
      fixture,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Benchmark Pay', () => {
    it('should render About the data with correct href', async () => {
      const { component, getByText } = await setup();

      const dataArea = getByText('About the data');
      const workplaceId = component.workplace.uid;
      expect(dataArea).toBeTruthy();
      expect(dataArea.getAttribute('href')).toEqual(`/workplace/${workplaceId}/benchmarks/about-the-data`);
    });

    it('should render lastupdated date', async () => {
      const { component, getByTestId } = await setup();
      component.tilesData?.meta.lastUpdated;

      expect(getByTestId('benchmarksLastUpdatedDate')).toBeTruthy();
    });

    it('should render benchmarks pay providers', async () => {
      const { component, getByTestId } = await setup();
      component.viewBenchmarksComparisonGroups;

      expect(getByTestId('benchmarksPayHeader')).toBeTruthy();
    });

    it('should render benchmarks pay comparison group ', async () => {
      const { component, getByTestId } = await setup();
      component.viewBenchmarksComparisonGroups;

      expect(getByTestId('benchmarksComparisonGroup')).toBeTruthy();
    });

    it('should render benchmarks Good and outstanding pay header', async () => {
      const { component, getByTestId, fixture } = await setup();

      component.viewBenchmarksComparisonGroups = true;
      fixture.detectChanges();

      expect(getByTestId('benchmarkGoodAndOutstandingHeader')).toBeTruthy();
    });

    it('should render benchmarks Good and outstanding pay comparison group', async () => {
      const { fixture, component, getByTestId } = await setup();
      component.viewBenchmarksComparisonGroups = true;
      fixture.detectChanges();

      expect(getByTestId('benchmarkGoodAndOutstandingComparison')).toBeTruthy();
    });
  });
});
