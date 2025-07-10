import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NewBenchmarksTabComponent } from './benchmarks-tab.component';
import { NewComparisonGroupHeaderComponent } from './comparison-group-header/comparison-group-header.component';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('NewBenchmarksTabComponent', () => {
  const setup = async (isAdmin = true, subsidiaries = 0, isParentViewingSubsidiary = false) => {
    const establishment = establishmentBuilder() as Establishment;
    const role = isAdmin ? Roles.Admin : Roles.Edit;
    const setupTools = await render(NewBenchmarksTabComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: BenchmarksServiceBase,
          useClass: MockBenchmarksService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory([], isAdmin),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, role),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        { provide: WindowToken, useValue: MockWindow },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        provideRouter([]),
      ],
      declarations: [NewComparisonGroupHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        workplace: establishment,
        isParentViewingSubsidiary: isParentViewingSubsidiary,
      },
    });

    const component = setupTools.fixture.componentInstance;

    const pdfService = TestBed.inject(PdfService);

    return {
      ...setupTools,
      component,
      pdfService,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should download the page as a pdf when the the download as pdf link is clicked', async () => {
    const { component, getByText, pdfService } = await setup();

    const downloadFunctionSpy = spyOn(component, 'downloadAsPDF').and.callThrough();
    const pdfServiceSpy = spyOn(pdfService, 'BuildBenchmarksPdf').and.callThrough();
    fireEvent.click(getByText('Download Benchmarks', { exact: false }));

    expect(downloadFunctionSpy).toHaveBeenCalled();
    expect(pdfServiceSpy).toHaveBeenCalled();
  });

  it('should not render the banner when in subsidiary view of benchmark tab', async () => {
    const { queryByTestId } = await setup(true, 0, true);
    expect(queryByTestId('dashboardHeader')).toBeFalsy();
  });

  it('should render the banner when in parent view of benchmark tab', async () => {
    const { queryByTestId } = await setup(true, 0, false);
    expect(queryByTestId('dashboardHeader')).toBeTruthy();
  });

  describe('getBreadcrumbsJourney', () => {
    it('should return subsidiary journey when viewing sub as parent', async () => {
      const { component } = await setup(false, 0, true);

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.SUBSIDIARY);
    });

    it('should return old benchmarks tab journey when not viewing sub', async () => {
      const { component } = await setup(false, 0, false);

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.OLD_BENCHMARKS_DATA_TAB);
    });
  });
});
