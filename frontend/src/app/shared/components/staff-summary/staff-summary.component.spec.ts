import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { PaginationComponent } from '../pagination/pagination.component';
import { TablePaginationWrapperComponent } from '../table-pagination-wrapper/table-pagination-wrapper.component';
import { StaffSummaryComponent } from './staff-summary.component';
import { PermissionType } from '@core/model/permissions.model';
import { SortByService } from '@core/services/sort-by.service';
import { MockSortByService } from '@core/test-utils/MockSortByService';
import { TabsService } from '@core/services/tabs.service';

fdescribe('StaffSummaryComponent', () => {
  async function setup(overrides: any = {}) {
    const establishment = establishmentBuilder() as Establishment;
    const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

    const localStorageSetSpy = spyOn(localStorage, 'setItem');
    const localStorageGetSpy = spyOn(localStorage, 'getItem');

    const setupTools = await render(StaffSummaryComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule],
      declarations: [PaginationComponent, TablePaginationWrapperComponent],
      providers: [
        {
          provide: SortByService,
          useFactory: MockSortByService.factory(overrides),
          deps: [Router, TabsService],
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(overrides.permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
        WorkerService,
        provideRouter([]),
      ],
      componentProperties: {
        workplace: establishment,
        workers: overrides.workers ?? workers,
        wdfView: overrides.isWdf ?? false,
        workerCount: overrides.workerCount ?? workers.length,
      },
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;

    const getAllWorkersSpy = spyOn(workerService, 'getAllWorkers').and.returnValue(
      of({ workers: [...workers, ...workers, ...workers, ...workers, ...workers, ...workers], workerCount: 18 }),
    );

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      router,
      component,
      workers,
      getAllWorkersSpy,
      localStorageSetSpy,
      localStorageGetSpy,
    };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('should render a StaffSummaryComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('should prep for individual staff record pagination', () => {
    beforeEach(() => {
      localStorage.clear();
    });
    it('should store full worker list in localstorage', async () => {
      const mockWorkers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      const eighteenWorkers = [
        ...mockWorkers,
        ...mockWorkers,
        ...mockWorkers,
        ...mockWorkers,
        ...mockWorkers,
        ...mockWorkers,
      ];
      const overrides = { isWdf: false, workers: eighteenWorkers };
      const { component, localStorageSetSpy } = await setup(overrides);

      expect(component.staffRecordIds?.length ?? -1).toBeGreaterThan(15);
      expect(localStorageSetSpy.calls.all()[3].args[0]).toEqual('ListOfWorkers');
    });
  });

  it('should render the correct information for given workers', async () => {
    const overrides = { permissions: ['canEditWorker'] };
    const { workers, fixture, getByText, getByTestId } = await setup(overrides);

    // update one of the fake workers
    workers[0].nameOrId = 'joe mocked';
    workers[0].mainJob.jobRoleName = 'fake doctor';
    workers[0].completed = false;
    fixture.detectChanges();

    const staffTableTestId = getByTestId('staff-table');

    expect(getByText('joe mocked')).toBeTruthy();
    expect(getByText('fake doctor')).toBeTruthy();
    expect(within(staffTableTestId).getAllByText('Add more details').length).toBe(3);
  });

  it('should render the add more details link with the correct routing', async () => {
    const overrides = { permissions: ['canEditWorker'] };

    const { component, workers, getAllByText, getByTestId } = await setup(overrides);

    const workplace = component.workplace;
    const staffTableTestId = getByTestId('staff-table');
    const addMoreDetailsLinks = within(staffTableTestId).getAllByText('Add more details');

    workers.map((worker, index) => {
      expect(addMoreDetailsLinks[index].getAttribute('href')).toEqual(
        `/workplace/${workplace.uid}/staff-record/${worker.uid}/date-of-birth`,
      );
    });
  });

  describe('Calling getAllWorkers when sorting', () => {
    describe('in wdf view', () => {
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
          const { component, getAllWorkersSpy, getByLabelText } = await setup({ isWdf: true });

          const select = getByLabelText('Sort by', { exact: false });
          fireEvent.change(select, { target: { value: option[0] } });

          const establishmentUid = component.workplace.uid;
          const paginationEmission = { pageIndex: 0, itemsPerPage: 15, sortBy: option[1] };

          expect(getAllWorkersSpy.calls.mostRecent().args[0]).toEqual(establishmentUid);
          expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(paginationEmission);
        });
      }
    });

    describe('not in wdf view', () => {
      const sortByOptions = [
        ['0_asc', 'staffNameAsc', 'Staff name (A to Z)'],
        ['0_dsc', 'staffNameDesc', 'Staff name (Z to A)'],
        ['1_asc', 'jobRoleAsc', 'Job role (A to Z)'],
        ['1_dsc', 'jobRoleDesc', 'Job role (Z to A)'],
        ['3_last_update_newest', 'lastUpdateNewest', 'Last update (newest)'],
        ['3_last_update_oldest', 'lastUpdateOldest', 'Last update (oldest)'],
        ['4_add_more_details', 'addMoreDetails', 'Add more details'],
      ];

      for (const option of sortByOptions) {
        it(`should call getAllWorkers with sortBy set to ${option[1]} when sorting by ${option[2]}`, async () => {
          const { component, getAllWorkersSpy, getByLabelText } = await setup({ isWdf: false });

          const select = getByLabelText('Sort by', { exact: false });
          fireEvent.change(select, { target: { value: option[0] } });

          const establishmentUid = component.workplace.uid;
          const paginationEmission = { pageIndex: 0, itemsPerPage: 15, sortBy: option[1] };

          expect(getAllWorkersSpy.calls.mostRecent().args[0]).toEqual(establishmentUid);
          expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(paginationEmission);
        });
      }
    });
  });

  describe('Calling getAllWorkers when using search', () => {
    it('it does not render the search bar when pagination threshold is not met', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search staff training records');
      expect(searchInput).toBeNull();
    });

    it('should call getAllWorkers with correct search term if passed and workerCount is greater than itemsPerPage', async () => {
      const overrides = { workerCount: 16 };

      const { getAllWorkersSpy, fixture, getByLabelText } = await setup(overrides);

      await fixture.whenStable();

      const searchInput = getByLabelText('Search by name or ID number for staff records');
      expect(searchInput).toBeTruthy();
      userEvent.type(searchInput, 'search term here{enter}');

      const expectedEmit = { pageIndex: 0, itemsPerPage: 15, sortBy: 'staffNameAsc', searchTerm: 'search term here' };
      expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
    });

    it('should reset the pageIndex before calling getAllWorkers when handling search', async () => {
      const overrides = { workerCount: 16 };

      const { getAllWorkersSpy, getByLabelText } = await setup(overrides);

      userEvent.type(getByLabelText('Search by name or ID number for staff records'), 'search term here{enter}');
      expect(getAllWorkersSpy.calls.mostRecent().args[1].pageIndex).toEqual(0);
    });

    it('should render the message that no workers were found if workerCount is falsy', async () => {
      const overrides = { workerCount: 0 };
      const { getByText } = await setup(overrides);

      expect(getByText('There are no matching results')).toBeTruthy();
      expect(getByText('Make sure that your spelling is correct.')).toBeTruthy();
    });
  });

  describe('getWorkerRecordPath', () => {
    it('navigates to the staff record summary when not in the wdf view', async () => {
      const overrides = { permissions: ['canViewWorker'] };
      const { component, router, workers, getByText } = await setup(overrides);

      const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
      const worker = workers[0];
      const nameLink = getByText(worker.nameOrId);
      fireEvent.click(nameLink);

      const workplace = component.workplace;
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplace.uid,
        'staff-record',
        worker.uid,
        'staff-record-summary',
      ]);
    });
  });

  describe('selected sort by values', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('localStorage should not be called if isWdf is true', async () => {
      const overrides = { isWdf: true };
      const { component, getByLabelText, localStorageSetSpy } = await setup(overrides);

      const sortByObjectKeys = Object.keys(component.sortStaffOptions);
      userEvent.selectOptions(getByLabelText('Sort by'), sortByObjectKeys[2]);

      expect(localStorageSetSpy).not.toHaveBeenCalled();
    });

    it('localStorage should be called if isWdf is false', async () => {
      const overrides = { isWdf: false };
      const { fixture, component, getByLabelText, localStorageSetSpy } = await setup(overrides);

      const sortByObjectKeys = Object.keys(component.sortStaffOptions);
      userEvent.selectOptions(getByLabelText('Sort by'), sortByObjectKeys[2]);

      expect(localStorageSetSpy).toHaveBeenCalledTimes(7); // spies have now been fixed to count in ngOnInit calls
      expect(localStorageSetSpy.calls.all()[4].args).toEqual(['staffSummarySortValue', component.sortByValue]);
      expect(localStorageSetSpy.calls.all()[5].args).toEqual(['staffSummarySearchTerm', '']);
      expect(localStorageSetSpy.calls.all()[6].args).toEqual(['staffSummaryIndex', '0']);
    });

    it('should use the values from returnLocalStorageForSort when its not the wdf view', async () => {
      const overrides = {
        isWdf: false,
        localStorageValuesForSort: {
          staffSummarySortValue: 'lastUpdateNewest',
          staffSummarySearchTerm: 'Ma',
          staffSummaryIndex: '0',
        },
      };

      const { component } = await setup(overrides);

      expect(component.sortByValue).toEqual('lastUpdateNewest');
      expect(component.searchTerm).toEqual('Ma');
      expect(component.pageIndex).toEqual(0);
    });
  });
});
