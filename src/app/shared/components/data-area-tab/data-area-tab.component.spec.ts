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
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
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

  it('should render the pay table and the correct heading when viewBenchmarksByCategory is false', async () => {
    const { component, fixture, getByTestId, queryByTestId } = await setup();

    component.viewBenchmarksByCategory = false;
    fixture.detectChanges();

    const categoryHeading = getByTestId('benchmarksCategoryHeading');

    expect(getByTestId('payTable')).toBeTruthy();
    expect(within(categoryHeading).getByText('Pay')).toBeTruthy();
    expect(queryByTestId('recruitmentAndRetentionTable')).toBeFalsy();
    expect(within(categoryHeading).queryByText('Recruitment and retention')).toBeFalsy();
  });

  describe('recruitment and retention', () => {
    it('should render the recruitment and retention table and the correct heading when viewBenchmarksByCategory is true', async () => {
      const { getByTestId, queryByTestId } = await setup();

      const selectCategoryLinks = getByTestId('selectCategoryLinks');

      fireEvent.click(within(selectCategoryLinks).getByText('Recruitment and retention'));
      const categoryHeading = getByTestId('benchmarksCategoryHeading');

      expect(getByTestId('recruitmentAndRetentionTable')).toBeTruthy();
      expect(within(categoryHeading).getByText('Recruitment and retention')).toBeTruthy();
      expect(queryByTestId('payTable')).toBeFalsy();
      expect(within(categoryHeading).queryByText('Pay')).toBeFalsy();
    });

    it('should render the table with the retention and recruitment values for the workplace and comparison data', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.viewBenchmarksByCategory = true;
      fixture.detectChanges();

      const table = getByTestId('recruitmentAndRetentionTable');
      const vacancyRow = within(table).getByTestId('vacancyRow');
      const turnoverRow = within(table).getByTestId('turnoverRow');
      const timeInRoleRow = within(table).getByTestId('timeInRoleRow');

      expect(within(vacancyRow).getByText('7%')).toBeTruthy();
      expect(within(vacancyRow).getByText('6%')).toBeTruthy();
      expect(within(turnoverRow).getByText('28%')).toBeTruthy();
      expect(within(turnoverRow).getByText('27%')).toBeTruthy();
      expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
      expect(within(timeInRoleRow).getByText('89%')).toBeTruthy();
    });

    it('should render the table with the retention and recruitment values for the workplace and goodCqc comparison data', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.viewBenchmarksByCategory = true;
      component.viewBenchmarksComparisonGroups = true;
      fixture.detectChanges();

      const table = getByTestId('recruitmentAndRetentionTable');
      const vacancyRow = within(table).getByTestId('vacancyRow');
      const turnoverRow = within(table).getByTestId('turnoverRow');
      const timeInRoleRow = within(table).getByTestId('timeInRoleRow');

      expect(within(vacancyRow).getByText('7%')).toBeTruthy();
      expect(within(vacancyRow).getByText('5%')).toBeTruthy();
      expect(within(turnoverRow).getByText('28%')).toBeTruthy();
      expect(within(turnoverRow).getByText('29%')).toBeTruthy();
      expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
      expect(within(timeInRoleRow).getByText('90%')).toBeTruthy();
    });
  });
});
