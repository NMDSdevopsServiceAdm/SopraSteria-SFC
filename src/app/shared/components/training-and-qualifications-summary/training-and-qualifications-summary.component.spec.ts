import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker, WorkersResponse } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
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
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { PaginationComponent } from '../pagination/pagination.component';
import { SearchInputComponent } from '../search-input/search-input.component';
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

  async function setup(qsParamGetMock = sinon.fake()) {
    const { fixture, getAllByText, getByText, getByLabelText, queryByLabelText } = await render(
      TrainingAndQualificationsSummaryComponent,
      {
        imports: [HttpClientTestingModule, RouterTestingModule],
        declarations: [PaginationComponent, SearchInputComponent],
        providers: [
          { provide: PermissionsService, useValue: mockPermissionsService },
          { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
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
        },
      },
    );

    const component = fixture.componentInstance;

    const router = TestBed.inject(Router) as Router;
    const spy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const workerService = TestBed.inject(WorkerService) as WorkerService;
    const workerServiceSpy = spyOn(workerService, 'getAllWorkers').and.callThrough();

    const sortBySpy = spyOn(component, 'handleSortUpdate').and.callThrough();
    const searchSpy = spyOn(component, 'handleSearch').and.callThrough();

    return {
      component,
      fixture,
      queryByLabelText,
      getByLabelText,
      getAllByText,
      getByText,
      spy,
      workerServiceSpy,
      sortBySpy,
      searchSpy,
      workerService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should handle sort by expiring soon', async () => {
    const { component, getByLabelText, sortBySpy, workerServiceSpy } = await setup();

    expect(workerServiceSpy).not.toHaveBeenCalled();

    const select = getByLabelText('Sort by', { exact: false });
    fireEvent.change(select, { target: { value: '1_expires_soon' } });

    expect(sortBySpy).toHaveBeenCalledOnceWith('1_expires_soon');
    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, {
      sortBy: 'trainingExpiringSoon',
      pageIndex: 0,
      itemsPerPage: 15,
    });
  });

  it('should handle sort by missing', async () => {
    const { component, getByLabelText, sortBySpy, workerServiceSpy } = await setup();

    expect(workerServiceSpy).not.toHaveBeenCalled();

    const select = getByLabelText('Sort by', { exact: false });
    fireEvent.change(select, { target: { value: '2_missing' } });

    expect(sortBySpy).toHaveBeenCalledOnceWith('2_missing');
    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, {
      sortBy: 'trainingMissing',
      pageIndex: 0,
      itemsPerPage: 15,
    });
  });

  it('resets the pageIndex if sort by is changed', async () => {
    const { fixture, component, getByLabelText } = await setup();

    component.currentPageIndex = 1;
    fixture.detectChanges();

    expect(component.currentPageIndex).toBe(1);

    const select = getByLabelText('Sort by', { exact: false });
    fireEvent.change(select, { target: { value: '2_missing' } });

    expect(component.currentPageIndex).toBe(0);
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

    expect(spy).toHaveBeenCalledWith([
      '/workplace',
      workplaceUid,
      'training-and-qualifications-record',
      worker.uid,
      'training',
    ]);
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

    expect(spy).toHaveBeenCalledWith([
      '/workplace',
      workplaceUid,
      'training-and-qualifications-record',
      worker.uid,
      'training',
      'wdf-summary',
    ]);
  });

  describe('calls getAllWorkers on workerService when using search', () => {
    it('it does not render the search bar when pagination threshold is not met', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search staff training records');
      expect(searchInput).toBeNull();
    });

    it('should call getAllWorkers with correct search term if passed', async () => {
      const { fixture, getByLabelText, workerServiceSpy, searchSpy } = await setup();
      // show search bar
      fixture.componentInstance.showSearchBar = true;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search staff training records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      const expectedEmit = {
        pageIndex: 0,
        itemsPerPage: 15,
        sortBy: 'trainingExpired',
        searchTerm: 'search term here',
      };
      expect(workerServiceSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
      expect(searchSpy).toHaveBeenCalledOnceWith('search term here');
    });

    it('should reset the pageIndex before calling getAllWorkers when handling search', async () => {
      const { fixture, getByLabelText, workerServiceSpy } = await setup();

      fixture.componentInstance.showSearchBar = true;
      fixture.componentInstance.currentPageIndex = 1;
      fixture.detectChanges();

      userEvent.type(getByLabelText('Search staff training records'), 'search term here{enter}');
      expect(workerServiceSpy.calls.mostRecent().args[1].pageIndex).toEqual(0);
    });

    it('should render the no results returned message when 0 workers returned from getAllWorkers after search', async () => {
      const { fixture, getByLabelText, workerService, getByText } = await setup();

      fixture.componentInstance.showSearchBar = true;
      fixture.detectChanges();

      sinon.stub(workerService, 'getAllWorkers').returns(
        of({
          workers: [],
          workerCount: 0,
        } as WorkersResponse),
      );

      const searchInput = getByLabelText('Search staff training records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      expect(getByText('There are no matching results')).toBeTruthy();
      expect(getByText('Make sure that your spelling is correct.')).toBeTruthy();
    });
  });

  describe('Query search params update correctly', () => {
    it('adds the search and tab as "training-and-qualifications" query params to the url on search', async () => {
      const { spy, fixture, getByLabelText } = await setup();

      fixture.componentInstance.showSearchBar = true;
      fixture.detectChanges();

      userEvent.type(getByLabelText('Search staff training records'), 'search term here{enter}');
      expect(spy).toHaveBeenCalledWith([], {
        fragment: 'training-and-qualifications',
        queryParams: { search: 'search term here', tab: 'training' },
        queryParamsHandling: 'merge',
      });
    });

    it('sets the searchTerm for staff record input if query params are found on render', async () => {
      const qsParamGetMock = sinon.stub();
      qsParamGetMock.onCall(0).returns('mysupersearch');
      qsParamGetMock.onCall(1).returns('training');

      const { fixture, getByLabelText } = await setup(qsParamGetMock);

      fixture.componentInstance.showSearchBar = true;
      fixture.detectChanges();

      expect((getByLabelText('Search staff training records') as HTMLInputElement).value).toBe('mysupersearch');
    });
  });
});
