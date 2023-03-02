import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker, WorkersResponse } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import {
  longTermAbsentWorker,
  MockWorkerService,
  workerWithExpiredTraining,
  workerWithExpiringTraining,
  workerWithMissingTraining,
  workerWithOneExpiringTraining,
  workerWithUpToDateTraining,
} from '@core/test-utils/MockWorkerService';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { PaginationComponent } from '../pagination/pagination.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { TablePaginationWrapperComponent } from '../table-pagination-wrapper/table-pagination-wrapper.component';
import { TrainingAndQualificationsSummaryComponent } from './training-and-qualifications-summary.component';

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

const workers = [
  workerWithExpiringTraining, // Alice
  workerWithExpiredTraining, // Ben
  workerWithOneExpiringTraining, // Carl
  workerWithMissingTraining, // Darlyn
  workerWithUpToDateTraining, // Ellie
  longTermAbsentWorker, // John
] as Worker[];

describe('TrainingAndQualificationsSummaryComponent', () => {
  const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
    can: sinon.stub<['uid', 'canViewUser'], boolean>().returns(true),
  });

  async function setup(qsParamGetMock = sinon.fake(), totalRecords = 5) {
    const { fixture, getAllByText, getByText, getByLabelText, queryByLabelText, getByTestId, queryByTestId } =
      await render(TrainingAndQualificationsSummaryComponent, {
        imports: [HttpClientTestingModule, RouterTestingModule],
        declarations: [TablePaginationWrapperComponent, PaginationComponent, SearchInputComponent],
        providers: [
          { provide: PermissionsService, useValue: mockPermissionsService },
          {
            provide: WorkerService,
            useClass: MockWorkerService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParamMap: {
                  get: qsParamGetMock,
                },
              },
            },
          },
        ],
        componentProperties: {
          workplace: establishmentBuilder() as Establishment,
          workers: workers as Worker[],
          workerCount: workers.length,
          totalRecords,
          sortByValue: 'trainingExpired',
        },
      });

    const component = fixture.componentInstance;

    const router = TestBed.inject(Router) as Router;
    const spy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerService = TestBed.inject(WorkerService) as WorkerService;
    const workerServiceSpy = spyOn(workerService, 'getAllWorkers').and.callThrough();
    const emitSpy = spyOn(component.changeStaffSortBy, 'emit');

    return {
      component,
      fixture,
      queryByLabelText,
      getByLabelText,
      getAllByText,
      getByText,
      getByTestId,
      queryByTestId,
      spy,
      workerServiceSpy,
      workerService,
      emitSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the no records text, when there are no t and q records for an establishment', async () => {
    const { getByTestId } = await setup(sinon.fake(), 0);

    expect(getByTestId('noRecords')).toBeTruthy();
  });

  it('should not show the sort by dropdown if there is only 1 staff record', async () => {
    const { component, fixture, queryByTestId } = await setup();
    component.workerCount = 1;
    fixture.detectChanges();
    expect(queryByTestId('sortBy')).toBeFalsy();
  });

  it('should handle sort by expired', async () => {
    const { component, getByLabelText, workerServiceSpy, emitSpy } = await setup();

    expect(workerServiceSpy).not.toHaveBeenCalled();

    const select = getByLabelText('Sort by', { exact: false });
    fireEvent.change(select, { target: { value: '0_expired' } });

    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, {
      sortBy: 'trainingExpired',
      pageIndex: 0,
      itemsPerPage: 15,
    });
    expect(emitSpy).toHaveBeenCalledOnceWith({ section: 'staff-summary', sortByValue: 'trainingExpired' });
  });

  it('should handle sort by expiring soon', async () => {
    const { component, getByLabelText, workerServiceSpy, emitSpy } = await setup();

    expect(workerServiceSpy).not.toHaveBeenCalled();

    const select = getByLabelText('Sort by', { exact: false });
    fireEvent.change(select, { target: { value: '1_expires_soon' } });

    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, {
      sortBy: 'trainingExpiringSoon',
      pageIndex: 0,
      itemsPerPage: 15,
    });
    expect(emitSpy).toHaveBeenCalledOnceWith({ section: 'staff-summary', sortByValue: 'trainingExpiringSoon' });
  });

  it('should handle sort by missing', async () => {
    const { component, getByLabelText, workerServiceSpy, emitSpy } = await setup();

    expect(workerServiceSpy).not.toHaveBeenCalled();

    const select = getByLabelText('Sort by', { exact: false });
    fireEvent.change(select, { target: { value: '2_missing' } });

    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, {
      sortBy: 'trainingMissing',
      pageIndex: 0,
      itemsPerPage: 15,
    });
    expect(emitSpy).toHaveBeenCalledOnceWith({ section: 'staff-summary', sortByValue: 'trainingMissing' });
  });

  it('should display the "OK" message if training is up to date', async () => {
    const { fixture, component } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(`table[data-testid='training-worker-table'] tbody tr`);

    expect(rows[4].innerHTML).toContain('Ellie');
    expect(rows[4].innerHTML).toContain('OK');
  });

  it('should display the "Long-term absent" tag if the worker is long term absent', async () => {
    const { fixture, component, getAllByText } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    expect(getAllByText('Long-term absent').length).toBe(1);
  });

  it('should navigate to the persons training, when clicking on their name', async () => {
    const { getByText, fixture, spy, component } = await setup();

    component.paginatedWorkers = workers;
    fixture.detectChanges();

    const link = getByText('Darlyn');
    fireEvent.click(link);

    const workplaceUid = component.workplace.uid;
    const worker = component.workers.find((worker) => worker.nameOrId === 'Darlyn');

    expect(spy).toHaveBeenCalledWith(
      ['/workplace', workplaceUid, 'training-and-qualifications-record', worker.uid, 'training'],
      { fragment: 'all-records' },
    );
  });

  it('should navigate to the persons wdf training, when the wdfView flag is true', async () => {
    const { getByText, fixture, spy, component } = await setup();

    component.paginatedWorkers = workers;
    component.wdfView = true;
    fixture.detectChanges();

    const link = getByText('Darlyn');
    fireEvent.click(link);

    const workplaceUid = component.workplace.uid;
    const worker = component.workers.find((worker) => worker.nameOrId === 'Darlyn');

    expect(spy).toHaveBeenCalledWith(
      ['/workplace', workplaceUid, 'training-and-qualifications-record', worker.uid, 'training', 'wdf-summary'],
      { fragment: 'all-records' },
    );
  });

  describe('calls getAllWorkers on workerService when using search', () => {
    it('it does not render the search bar when pagination threshold is not met', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search by name or ID number staff training records');
      expect(searchInput).toBeNull();
    });

    it('should call getAllWorkers with correct search term if passed', async () => {
      const { component, fixture, getByLabelText, workerServiceSpy } = await setup();

      component.totalWorkerCount = 16;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search by name or ID number staff training records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      const expectedEmit = {
        pageIndex: 0,
        itemsPerPage: 15,
        sortBy: 'trainingExpired',
        searchTerm: 'search term here',
      };

      expect(workerServiceSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
    });

    it('should reset the pageIndex before calling getAllWorkers when handling search', async () => {
      const { component, fixture, getByLabelText, workerServiceSpy } = await setup();

      component.totalWorkerCount = 16;
      fixture.detectChanges();

      userEvent.type(getByLabelText('Search by name or ID number staff training records'), 'search term here{enter}');
      expect(workerServiceSpy.calls.mostRecent().args[1].pageIndex).toEqual(0);
    });

    it('should render the no results returned message when 0 workers returned from getAllWorkers after search', async () => {
      const { component, fixture, getByLabelText, getByText, workerService } = await setup();

      component.totalWorkerCount = 16;
      fixture.detectChanges();

      sinon.stub(workerService, 'getAllWorkers').returns(
        of({
          workers: [],
          workerCount: 0,
        } as WorkersResponse),
      );

      const searchInput = getByLabelText('Search by name or ID number staff training records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      expect(getByText('There are no matching results')).toBeTruthy();
      expect(getByText('Make sure that your spelling is correct.')).toBeTruthy();
    });
  });

  describe('Query search params update correctly', () => {
    it('sets the searchTerm for staff record input if query params are found on render', async () => {
      const qsParamGetMock = sinon.stub();
      qsParamGetMock.onCall(0).returns('mysupersearch');
      qsParamGetMock.onCall(1).returns('training');

      const { component, fixture, getByLabelText } = await setup(qsParamGetMock);

      component.totalWorkerCount = 16;
      fixture.detectChanges();
      expect((getByLabelText('Search by name or ID number staff training records') as HTMLInputElement).value).toBe(
        'mysupersearch',
      );
    });
  });
});
