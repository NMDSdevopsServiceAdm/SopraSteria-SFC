import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { PaginationComponent } from '../pagination/pagination.component';
import { TablePaginationWrapperComponent } from '../table-pagination-wrapper/table-pagination-wrapper.component';
import { StaffSummaryComponent } from './staff-summary.component';

describe('StaffSummaryComponent', () => {
  async function setup(isWdf = false, qsParamGetMock = sinon.fake()) {
    const establishment = establishmentBuilder() as Establishment;
    const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

    const component = await render(StaffSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [PaginationComponent, TablePaginationWrapperComponent],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        WorkerService,
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
        workplace: establishment,
        workers: workers,
        wdfView: isWdf,
        workerCount: workers.length,
      },
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;

    const getAllWorkersSpy = spyOn(workerService, 'getAllWorkers').and.returnValue(
      of({ workers: [...workers, ...workers, ...workers, ...workers, ...workers, ...workers], workerCount: 18 }),
    );

    return {
      router,
      component,
      workers,
      getAllWorkersSpy,
    };
  }

  it('should render a StaffSummaryComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the correct information for given workers', async () => {
    const { component, workers } = await setup();

    component.fixture.componentInstance.canEditWorker = true;
    // update one of the fake workers
    workers[0].nameOrId = 'joe mocked';
    workers[0].mainJob.jobRoleName = 'fake doctor';
    workers[0].completed = false;
    component.detectChanges();

    expect(component.getByText('joe mocked')).toBeTruthy();
    expect(component.getByText('fake doctor')).toBeTruthy();
    expect(component.getAllByText('Add more details').length).toBe(3);
  });

  it('should render the add more details link with the correct routing', async () => {
    const { component, workers } = await setup();

    component.fixture.componentInstance.canEditWorker = true;
    component.detectChanges();

    const workplace = component.fixture.componentInstance.workplace;
    const addMoreDetailsLinks = component.getAllByText('Add more details');

    workers.map((worker, index) => {
      expect(addMoreDetailsLinks[index].getAttribute('href')).toEqual(
        `/workplace/${workplace.uid}/staff-record/${worker.uid}/date-of-birth`,
      );
    });
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
        const { component, getAllWorkersSpy } = await setup(true);

        const select = component.getByLabelText('Sort by', { exact: false });
        fireEvent.change(select, { target: { value: option[0] } });

        const establishmentUid = component.fixture.componentInstance.workplace.uid;
        const paginationEmission = { pageIndex: 0, itemsPerPage: 15, sortBy: option[1] };

        expect(getAllWorkersSpy.calls.mostRecent().args[0]).toEqual(establishmentUid);
        expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(paginationEmission);
      });
    }
  });

  describe('Calling getAllWorkers when using search', () => {
    it('it does not render the search bar when pagination threshold is not met', async () => {
      const { component } = await setup();

      const searchInput = component.queryByLabelText('Search staff training records');
      expect(searchInput).toBeNull();
    });
    it('should call getAllWorkers with correct search term if passed and workerCount is greater than itemsPerPage', async () => {
      const { component, getAllWorkersSpy } = await setup();

      await component.fixture.whenStable();
      // show search
      component.fixture.componentInstance.totalWorkerCount = 16;
      component.fixture.detectChanges();

      const searchInput = component.getByLabelText('Search for staff records');
      expect(searchInput).toBeTruthy();
      userEvent.type(searchInput, 'search term here{enter}');

      const expectedEmit = { pageIndex: 0, itemsPerPage: 15, sortBy: 'staffNameAsc', searchTerm: 'search term here' };
      expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
    });

    it('should reset the pageIndex before calling getAllWorkers when handling search', async () => {
      const { component, getAllWorkersSpy } = await setup();

      component.fixture.componentInstance.totalWorkerCount = 16;
      component.fixture.detectChanges();

      userEvent.type(component.getByLabelText('Search for staff records'), 'search term here{enter}');
      expect(getAllWorkersSpy.calls.mostRecent().args[1].pageIndex).toEqual(0);
    });

    it('should render the message that no workers were found if workerCount is falsy', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.totalWorkerCount = 16;
      component.fixture.componentInstance.workerCount = 0;
      component.fixture.detectChanges();

      expect(component.getByText('There are no matching results')).toBeTruthy();
      expect(component.getByText('Make sure that your spelling is correct.')).toBeTruthy();
    });
  });

  describe('Query search params update correctly', () => {
    it('sets the searchTerm for staff record input if query params are found on render', async () => {
      const qsParamGetMock = sinon.stub();
      qsParamGetMock.onCall(0).returns('mysupersearch');
      qsParamGetMock.onCall(1).returns('staff');

      const { component } = await setup(false, qsParamGetMock);

      await component.fixture.whenStable();
      component.fixture.componentInstance.totalWorkerCount = 16;
      component.fixture.detectChanges();

      expect((component.getByLabelText('Search for staff records') as HTMLInputElement).value).toBe('mysupersearch');
    });
  });

  describe('getWorkerRecordPath', () => {
    it('navigates to the staff record summary when not in the wdf view', async () => {
      const { component, router, workers } = await setup();

      component.fixture.componentInstance.canViewWorker = true;
      component.detectChanges();
      const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
      const worker = workers[0];
      const nameLink = component.getByText(worker.nameOrId);
      fireEvent.click(nameLink);

      const workplace = component.fixture.componentInstance.workplace;
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplace.uid,
        'staff-record',
        worker.uid,
        'staff-record-summary',
      ]);
    });
  });
});
