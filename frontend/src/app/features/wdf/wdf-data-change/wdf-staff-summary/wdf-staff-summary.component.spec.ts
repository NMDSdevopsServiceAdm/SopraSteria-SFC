import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WdfModule } from '../wdf.module';
import { WdfStaffSummaryComponent } from './wdf-staff-summary.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { TablePaginationWrapperComponent } from '@shared/components/table-pagination-wrapper/table-pagination-wrapper.component';
import { WorkerService } from '@core/services/worker.service';
import sinon from 'sinon';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { getTestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import userEvent from '@testing-library/user-event';

describe('WdfStaffSummaryComponent', () => {
  const setup = async (overrides: any = {}) => {
    const establishment = establishmentBuilder() as Establishment;
    const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

    const { fixture, getByText, getAllByText, getByTestId, queryByText, getByLabelText, queryByLabelText } =
      await render(WdfStaffSummaryComponent, {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule, RouterModule],
        declarations: [PaginationComponent, TablePaginationWrapperComponent, SearchInputComponent],
        providers: [
          { provide: ReportService, useClass: MockReportService },
          {
            provide: PermissionsService,
            useFactory: MockPermissionsService.factory(['canViewWorker']),
            deps: [HttpClient, Router, UserService],
          },
          WorkerService,
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParamMap: {
                  get: sinon.fake(),
                },
                params: {
                  establishmentuid: establishment.uid,
                },
              },
            },
          },
          { provide: EstablishmentService, useClass: MockEstablishmentService },
        ],
        componentProperties: {
          workplace: establishment,
          wdfView: true,
          workers: workers,
          workerCount: workers.length,
          ...overrides,
        },
      });
    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;

    const getAllWorkersSpy = spyOn(workerService, 'getAllWorkers').and.returnValue(
      of({ workers: [...workers, ...workers, ...workers, ...workers, ...workers, ...workers], workerCount: 18 }),
    );

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      getByLabelText,
      queryByLabelText,
      router,
      getAllWorkersSpy,
    };
  };

  it('should render a WdfStaffSummaryComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the table headers', async () => {
    const { getByText } = await setup();

    expect(getByText('Name or ID number')).toBeTruthy();
    expect(getByText('Job role')).toBeTruthy();
    expect(getByText('Last update')).toBeTruthy();
    expect(getByText('Funding requirements')).toBeTruthy();
  });

  describe('Calling getAllWorkers when sorting', () => {
    const sortByOptions = [
      ['0_asc', 'staffNameAsc', 'Staff name (A to Z)'],
      ['0_dsc', 'staffNameDesc', 'Staff name (Z to A)'],
      ['1_asc', 'jobRoleAsc', 'Job role (A to Z)'],
      ['1_dsc', 'jobRoleDesc', 'Job role (Z to A)'],
      ['2_meeting', 'wdfMeeting', 'WDF requirements (meeting)'],
      ['2_not_meeting', 'wdfNotMeeting', 'WDF requirements (not meeting)'],
    ];

    for (const option of sortByOptions) {
      it(`should call getAllWorkers with sortBy set to ${option[1]} when sorting by ${option[2]}`, async () => {
        const { fixture, getAllWorkersSpy, getByLabelText } = await setup(true);

        const select = getByLabelText('Sort by', { exact: false });
        fireEvent.change(select, { target: { value: option[0] } });

        const establishmentUid = fixture.componentInstance.workplace.uid;
        const paginationEmission = { pageIndex: 0, itemsPerPage: 15, sortBy: option[1] };

        expect(getAllWorkersSpy.calls.mostRecent().args[0]).toEqual(establishmentUid);
        expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(paginationEmission);
      });
    }
  });

  describe('Calling getAllWorkers when using search', () => {
    it('it does not render the search bar when pagination threshold is not met', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search staff training records');
      expect(searchInput).toBeNull();
    });

    it('should display the label for the search input', async () => {
      const overrides = {
        workerCount: 16,
      };

      const { fixture, getByText, getByLabelText, getAllWorkersSpy } = await setup(overrides);

      await fixture.whenStable();

      expect(getByText('Search by name or ID number')).toBeTruthy();
      const searchInput = getByLabelText('Search by name or ID number for staff records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      const expectedEmit = { pageIndex: 0, itemsPerPage: 15, sortBy: 'staffNameAsc', searchTerm: 'search term here' };
      expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
    });

    it('should reset the pageIndex before calling getAllWorkers when handling search', async () => {
      const overrides = {
        workerCount: 16,
      };

      const { getAllWorkersSpy, getByLabelText } = await setup(overrides);

      userEvent.type(getByLabelText('Search by name or ID number for staff records'), 'search term here{enter}');
      expect(getAllWorkersSpy.calls.mostRecent().args[1].pageIndex).toEqual(0);
    });

    it('should display the message when there is no staff', async () => {
      const overrides = {
        workers: [],
        workerCount: 0,
        standAloneAccount: true,
      };

      const { getByTestId } = await setup(overrides);

      const noRecordsTestId = getByTestId('noRecords');

      const message =
        'You need to add some staff records before you can check whether your data meets funding requirements.';
      expect(noRecordsTestId).toBeTruthy();
      expect(noRecordsTestId.textContent).toContain(message);
    });
  });

  it('should display green ticks on 3 staff records when the user has qualified for WDF and all staff records are eligible', async () => {
    const { component, fixture, getAllByText } = await setup();
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    component.overallWdfEligibility = true;
    component.workers[0].wdfEligible = true;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = true;
    fixture.detectChanges();

    expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(3);
    expect(getAllByText(meetingMessage, { exact: true }).length).toBe(3);
  });

  it('should display an orange flag on staff record when the user has qualified for WDF but 1 staff record is no longer eligible', async () => {
    const { component, fixture, getByText } = await setup();
    const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';
    const notMeetingMessage = 'Not meeting';

    component.overallWdfEligibility = true;
    component.workers[0].wdfEligible = false;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = true;
    fixture.detectChanges();

    expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(notMeetingMessage, { exact: true })).toBeTruthy();
  });

  it('should display one orange flag and two green flags when the user has qualified for WDF but 1 staff record is no longer eligible and two still are', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();
    const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';
    const notMeetingMessage = 'Not meeting';
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    component.overallWdfEligibility = true;
    component.workers[0].wdfEligible = false;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = true;
    fixture.detectChanges();

    expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(notMeetingMessage, { exact: true })).toBeTruthy();
    expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(2);
    expect(getAllByText(meetingMessage, { exact: true }).length).toBe(2);
  });

  it('should display a red flag on staff record when the user has not qualified for WDF overall and 1 staff record is not eligible', async () => {
    const { component, fixture, getByText } = await setup();
    const redFlagVisuallyHiddenMessage = 'Red flag';
    const notMeetingMessage = 'Not meeting';

    component.overallWdfEligibility = false;
    component.workers[0].wdfEligible = false;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = true;
    fixture.detectChanges();

    expect(getByText(redFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(notMeetingMessage, { exact: true })).toBeTruthy();
  });

  it('should display two red flags and one green tick when the user has not qualified for WDF but 1 staff record is eligible and two are not', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();
    const redFlagVisuallyHiddenMessage = 'Red flag';
    const notMeetingMessage = 'Not meeting';
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    component.overallWdfEligibility = false;
    component.workers[0].wdfEligible = false;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = false;
    fixture.detectChanges();

    expect(getAllByText(redFlagVisuallyHiddenMessage, { exact: false }).length).toBe(2);
    expect(getAllByText(notMeetingMessage, { exact: true }).length).toBe(2);
    expect(getByText(greenTickVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(meetingMessage, { exact: true })).toBeTruthy();
  });
});
