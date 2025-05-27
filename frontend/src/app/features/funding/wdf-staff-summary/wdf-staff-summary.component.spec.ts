import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { TablePaginationWrapperComponent } from '@shared/components/table-pagination-wrapper/table-pagination-wrapper.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { FundingModule } from '../funding.module';
import { WdfStaffSummaryComponent } from './wdf-staff-summary.component';

describe('WdfStaffSummaryComponent', () => {
  const setup = async (overrides: any = {}) => {
    const establishment = establishmentBuilder() as Establishment;
    const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

    const setupTools = await render(WdfStaffSummaryComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, FundingModule, RouterModule],
      declarations: [PaginationComponent, TablePaginationWrapperComponent, SearchInputComponent],
      providers: [
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
              params: overrides?.params ?? {
                establishmentuid: establishment.uid,
              },
            },
          },
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
      ],
      componentProperties: {
        workplace: establishment,
        workers: workers,
        workerCount: workers.length,
        ...overrides?.componentProperties,
      },
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(null);
    const workerService = injector.inject(WorkerService) as WorkerService;

    const getAllWorkersSpy = spyOn(workerService, 'getAllWorkers').and.returnValue(
      of({ workers: [...workers, ...workers, ...workers, ...workers, ...workers, ...workers], workerCount: 18 }),
    );

    return {
      ...setupTools,
      component,
      routerSpy,
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
      ['2_meeting', 'wdfMeeting', 'Funding requirements (meeting)'],
      ['2_not_meeting', 'wdfNotMeeting', 'Funding requirements (not meeting)'],
    ];

    for (const option of sortByOptions) {
      it(`should call getAllWorkers with sortBy set to ${option[1]} when sorting by ${option[2]}`, async () => {
        const { component, getAllWorkersSpy, getByLabelText, getByText } = await setup();

        const select = getByLabelText('Sort by', { exact: false });

        const optionElement = getByText(option[2]) as HTMLOptionElement;
        fireEvent.change(select, { target: { value: optionElement.value } });

        const establishmentUid = component.workplace.uid;
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
        componentProperties: {
          workerCount: 16,
        },
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
        componentProperties: {
          workerCount: 16,
        },
      };

      const { getAllWorkersSpy, getByLabelText } = await setup(overrides);

      userEvent.type(getByLabelText('Search by name or ID number for staff records'), 'search term here{enter}');
      expect(getAllWorkersSpy.calls.mostRecent().args[1].pageIndex).toEqual(0);
    });
  });

  describe('No staff records message', () => {
    it('should display the message when there are no staff records', async () => {
      const overrides = {
        componentProperties: {
          workers: [],
          workerCount: 0,
        },
      };

      const { getByTestId } = await setup(overrides);

      const noRecordsTestId = getByTestId('noRecords');

      const message =
        'You need to add some staff records before you can check whether your data meets funding requirements.';
      expect(noRecordsTestId).toBeTruthy();
      expect(noRecordsTestId.textContent).toContain(message);
    });

    it('should navigate to staff records tab when is not parent user viewing sub workplace (no uid in params)', async () => {
      const overrides = {
        componentProperties: {
          workers: [],
          workerCount: 0,
        },
        params: {},
      };

      const { getByText, routerSpy } = await setup(overrides);

      const staffRecordsLink = getByText('add some staff records');
      userEvent.click(staffRecordsLink);

      expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'staff-records' });
    });

    it('should navigate to subsidiary staff records tab when parent user viewing sub workplace (uid in params)', async () => {
      const workplace = establishmentBuilder();
      workplace.uid = 'a123koj3213233';

      const overrides = {
        componentProperties: {
          workers: [],
          workerCount: 0,
          workplace,
        },
        params: { establishmentuid: workplace.uid },
      };

      const { getByText, routerSpy } = await setup(overrides);

      const staffRecordsLink = getByText('add some staff records');
      userEvent.click(staffRecordsLink);

      expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', workplace.uid, 'staff-records']);
    });
  });

  describe('Eligibility icons for staff', () => {
    const redFlagVisuallyHiddenMessage = 'Red flag';
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';
    const newStaffRecordMessage = 'New staff record';
    const notMeetingMessage = 'Not meeting';
    const meetingMessage = 'Meeting';

    it('should display green ticks on 3 staff records when the user has qualified for WDF and all staff records are eligible', async () => {
      const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      workers[0].wdfEligible = true;
      workers[1].wdfEligible = true;
      workers[2].wdfEligible = true;
      const overrides = {
        componentProperties: {
          workers,
          overallWdfEligibility: true,
        },
      };

      const { getAllByText } = await setup(overrides);

      expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(3);
      expect(getAllByText(meetingMessage, { exact: true }).length).toBe(3);
    });

    it("should display an orange flag and 'New staff record' on staff record when the user has qualified for WDF but 1 staff record is not eligible (new)", async () => {
      const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      workers[0].wdfEligible = false;
      workers[1].wdfEligible = true;
      workers[2].wdfEligible = true;
      const overrides = {
        componentProperties: { workers, overallWdfEligibility: true },
      };

      const { getByText } = await setup(overrides);

      expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
      expect(getByText(newStaffRecordMessage, { exact: true })).toBeTruthy();
    });

    it('should display one orange flag and two green flags when the user has qualified for WDF but 1 staff record is not eligible and two still are', async () => {
      const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      workers[0].wdfEligible = false;
      workers[1].wdfEligible = true;
      workers[2].wdfEligible = true;
      const overrides = {
        componentProperties: { workers, overallWdfEligibility: true },
      };

      const { getByText, getAllByText } = await setup(overrides);

      expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
      expect(getByText(newStaffRecordMessage, { exact: true })).toBeTruthy();
      expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(2);
      expect(getAllByText(meetingMessage, { exact: true }).length).toBe(2);
    });

    it('should display a red flag on staff record when the user has not qualified for WDF overall and 1 staff record is not eligible', async () => {
      const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      workers[0].wdfEligible = false;
      workers[1].wdfEligible = true;
      workers[2].wdfEligible = true;
      const overrides = {
        componentProperties: { workers, overallWdfEligibility: false },
      };

      const { getByText } = await setup(overrides);

      expect(getByText(redFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
      expect(getByText(notMeetingMessage, { exact: true })).toBeTruthy();
    });

    it('should display two red flags and one green tick when the user has not qualified for WDF but 1 staff record is eligible and two are not', async () => {
      const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      workers[0].wdfEligible = false;
      workers[1].wdfEligible = true;
      workers[2].wdfEligible = false;
      const overrides = {
        componentProperties: { workers, overallWdfEligibility: false },
      };

      const { getByText, getAllByText } = await setup(overrides);

      expect(getAllByText(redFlagVisuallyHiddenMessage, { exact: false }).length).toBe(2);
      expect(getAllByText(notMeetingMessage, { exact: true }).length).toBe(2);
      expect(getByText(greenTickVisuallyHiddenMessage, { exact: false })).toBeTruthy();
      expect(getByText(meetingMessage, { exact: true })).toBeTruthy();
    });
  });
});
