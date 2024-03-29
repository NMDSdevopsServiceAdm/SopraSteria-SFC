import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { WdfModule } from '../wdf.module';
import { WdfWorkplacesSummaryComponent } from './wdf-workplaces-summary.component';

describe('WdfWorkplacesSummaryComponent', () => {
  const setup = async (viewPermission?) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfWorkplacesSummaryComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: ReportService, useClass: MockReportService },
        { provide: UserService, useClass: MockUserService },
        {
          provide: PermissionsService,
          useFactory: viewPermission
            ? MockPermissionsService.factory(['canViewEstablishment'])
            : MockPermissionsService.factory(['canEditEstablishment']),
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

  it('should show the download a WDF report when the user has edit permissions', async () => {
    const { getByText } = await setup();
    expect(getByText('Download your WDF report (Excel)', { exact: false })).toBeTruthy();
  });

  it('should not show the download a WDF report when the user has view permissions', async () => {
    const { queryByText } = await setup(true);
    expect(queryByText('Download your WDF report (Excel)', { exact: false })).toBeFalsy();
  });

  it('should download a WDF report when the download link is clicked', async () => {
    const { fixture, getByText } = await setup();

    const reportService = TestBed.inject(ReportService);
    const getReport = spyOn(reportService, 'getParentWDFReport').and.callFake(() => of(null));
    const saveAs = spyOn(fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(getByText('Download your WDF report (Excel)', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  describe('WdfParentStatusMessageComponent', async () => {
    it('should display the correct message and timeframe if meeting WDF requirements', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `All your workplaces' data meets the WDF ${year} to ${year + 1} requirements`;

      component.parentOverallEligibilityStatus = true;
      component.parentCurrentEligibilityStatus = true;
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });

    it('should display the correct message if workplaces have met WDF requirements this year but not meeting currently', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Your workplaces met the WDF ${year} to ${
        year + 1
      } requirements, but updating those currently shown as 'not meeting' will save you time next year.`;

      component.parentOverallEligibilityStatus = true;
      component.parentCurrentEligibilityStatus = false;
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });

    it('should display the correct message if workplaces have not met WDF requirements this year', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Some of your workplaces' data does not meet the WDF ${year} to ${
        year + 1
      } requirements`;

      component.parentOverallEligibilityStatus = false;
      component.parentCurrentEligibilityStatus = false;
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });
  });

  describe('workplace rendering', async () => {
    it('Should not display a sub workplace with a ustatus of PENDING or IN PROGRESS', async () => {
      const { fixture } = await setup();
      const wdfWorkplaceTableRows = fixture.nativeElement.querySelectorAll('tr');
      const rowOne = wdfWorkplaceTableRows[1];

      //One array location as headings, another as the primary workplace and the final as the only valid sub account
      expect(wdfWorkplaceTableRows.length).toEqual(3);
      expect(rowOne.cells['0'].innerHTML).toContain('First Subsid Workplace');
      expect(rowOne.cells['1'].innerHTML).toContain('Not meeting');
      expect(rowOne.cells['2'].innerHTML).toContain('Not meeting');
    });
  });
});
