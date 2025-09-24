import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { BenchmarksSelectViewPanelComponent } from '../benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { DataAreaTabComponent } from './data-area-tab.component';

describe('DataAreaTabComponent', () => {
  const setup = async (newDashboard = true, showBanner = true) => {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
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
          provide: BenchmarksV2Service,
          useClass: MockBenchmarksService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      provideHttpClient(), provideHttpClientTesting(),],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        workplace: establishment,
        newDashboard,
        showBanner,
      },
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService) as ParentSubsidiaryViewService;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
      parentSubsidiaryViewService,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the new dashboard header when showBanner is true', async () => {
    const { queryByTestId } = await setup(true, true);

    expect(queryByTestId('newDashboardHeader')).toBeTruthy();
  });

  it('should not render the new dashboard header when showBanner is false', async () => {
    const { queryByTestId } = await setup(true, false);

    expect(queryByTestId('newDashboardHeader')).toBeFalsy();
  });

  it('should not render the new dashboard header when newDashboard is false', async () => {
    const { queryByTestId } = await setup(false, true);

    expect(queryByTestId('newDashboardHeader')).toBeFalsy();
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

  describe('getBreadcrumbsJourney', () => {
    it('should return subsidiary journey when viewing sub as parent', async () => {
      const { component, parentSubsidiaryViewService } = await setup();
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.SUBSIDIARY);
    });

    it('should return benchmarks tab journey when not viewing sub', async () => {
      const { component, parentSubsidiaryViewService } = await setup();
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(false);
      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.BENCHMARKS_TAB);
    });
  });
});