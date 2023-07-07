import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { BenchmarksSelectViewPanelComponent } from '../benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { DataAreaTabComponent } from './data-area-tab.component';

describe('DataAreaTabComponent', () => {
  const setup = async (newDashboard = true) => {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaTabComponent, {
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
          provide: BenchmarksService,
          useClass: MockBenchmarksService,
        },
      ],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        workplace: establishment,
        newDashboard,
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

  it('should render the pay area and the correct heading when viewBenchmarksByCategory is false', async () => {
    const { component, fixture, getByTestId, queryByTestId } = await setup();

    component.viewBenchmarksByCategory = false;
    fixture.detectChanges();

    const categoryHeading = getByTestId('benchmarksCategoryHeading');

    expect(getByTestId('payArea')).toBeTruthy();
    expect(within(categoryHeading).getByText('Pay')).toBeTruthy();
    expect(queryByTestId('recruitmentAndRetentionArea')).toBeFalsy();
    expect(within(categoryHeading).queryByText('Recruitment and retention')).toBeFalsy();
  });

  it('should render the recruitment and retention area and the correct heading when viewBenchmarksByCategory is true', async () => {
    const { component, fixture, getByTestId, queryByTestId } = await setup();

    component.viewBenchmarksByCategory = true;
    fixture.detectChanges();

    const selectCategoryLinks = getByTestId('selectCategoryLinks');

    fireEvent.click(within(selectCategoryLinks).getByText('Recruitment and retention'));
    const categoryHeading = getByTestId('benchmarksCategoryHeading');

    expect(getByTestId('recruitmentAndRetentionArea')).toBeTruthy();
    expect(within(categoryHeading).getByText('Recruitment and retention')).toBeTruthy();
    expect(queryByTestId('payArea')).toBeFalsy();
    expect(within(categoryHeading).queryByText('Pay')).toBeFalsy();
  });

  it('should check the pay benchmarks data to see if there is comparison data', async () => {
    const { component } = await setup();
    const noCompData = {
      value: 0,
      stateMessage: 'no-data',
      hasValue: false,
    };
    component.tilesData.careWorkerPay.comparisonGroup = noCompData;
    component.tilesData.seniorCareWorkerPay.comparisonGroup = noCompData;
    component.tilesData.registeredNursePay.comparisonGroup = noCompData;
    component.tilesData.registeredManagerPay.comparisonGroup = noCompData;

    component.checkComparisonDataExists();

    expect(component.comparisonDataExists).toBeFalsy();
  });
});
