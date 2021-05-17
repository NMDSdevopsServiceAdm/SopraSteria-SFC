import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfModule } from '../wdf.module.js';
import { WdfWorkplacesSummaryComponent } from './wdf-workplaces-summary.component';

describe('WdfWorkplacesSummaryComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfWorkplacesSummaryComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: ReportService, useClass: MockReportService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canViewWorker']),
          deps: [HttpClient, Router, UserService],
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfWorkplacesSummaryComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('WdfStatusMessageComponent', async () => {
    it('should display the correct message and timeframe if meeting WDF requirements', async () => {
      const { component, fixture, getByText } = await setup();
      const timeframeSentence = "All your workplaces' data meets the WDF 2021 to 2022 requirements";

      component.parentWdfEligibilityStatus = true;
      fixture.detectChanges();

      expect(getByText(timeframeSentence, { exact: false })).toBeTruthy();
    });
  });
});
