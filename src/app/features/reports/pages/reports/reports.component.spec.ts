import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { ReportsComponent } from './reports.component';

describe('ReportsComponent', async () => {
  const setup = async (isAdmin = true, isLoggedIn: boolean = true) => {
    return await render(ReportsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        ReportService,
        UserService,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(isLoggedIn, isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
      ],
    });
  };

  it('should download a registration survey report when the "Download report" button is clicked', async () => {
    const component = await setup();

    const reportService = TestBed.inject(ReportService);
    const getReport = spyOn(reportService, 'getRegistrationSurveyReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(component.getByText('Download registration survey report', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  it('should download a satisfaction survey report when the "Download report" button is clicked', async () => {
    const component = await setup();

    const reportService = TestBed.inject(ReportService);
    const getReport = spyOn(reportService, 'getSatisfactionSurveyReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(component.getByText('Download satisfaction survey report', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });
});
