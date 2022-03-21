import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { establishmentBuilder, workerBuilder } from '../../../../../server/test/factories/models';
import { PaginationComponent } from '../pagination/pagination.component';
import { StaffSummaryComponent } from './staff-summary.component';

describe('StaffSummaryComponent', () => {
  async function setup(isWdf = false) {
    const establishment = establishmentBuilder() as Establishment;
    const workers = [workerBuilder(), workerBuilder(), workerBuilder()];

    const component = await render(StaffSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [PaginationComponent],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        WorkerService,
      ],
      componentProperties: {
        workplace: establishment,
        workers: workers,
        wdfView: isWdf,
        workerCount: workers.length,
      },
    });

    const injector = getTestBed();
    const workerService = injector.inject(WorkerService) as WorkerService;
    const getAllWorkersSpy = spyOn(workerService, 'getAllWorkers').and.returnValue(
      of({ workers: [...workers, ...workers, ...workers, ...workers, ...workers, ...workers], workerCount: 18 }),
    );

    return {
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
    workers[0].jobRole = 'fake doctor';
    workers[0].completed = false;
    component.detectChanges();

    expect(component.getByText('joe mocked')).toBeTruthy();
    expect(component.getByText('fake doctor')).toBeTruthy();
    expect(component.getAllByText('Add more details').length).toBe(3);
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

  describe('Calling getAllWorkers when using pagination', () => {
    it('should call getAllWorkers on load with establishment uid, pageIndex 0 and itemsPerPage 15', async () => {
      const { component, getAllWorkersSpy } = await setup();

      await component.fixture.whenStable();

      const establishmentUid = component.fixture.componentInstance.workplace.uid;
      const paginationEmission = { pageIndex: 0, itemsPerPage: 15, sortBy: 'staffNameAsc' };

      expect(getAllWorkersSpy.calls.mostRecent().args[0]).toEqual(establishmentUid);
      expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(paginationEmission);
    });
  });

  describe('Calling getAllWorkers when using search', () => {
    it('should call getAllWorkers with correct search term if passed', async () => {
      const { component, getAllWorkersSpy } = await setup();

      await component.fixture.whenStable();

      const searchInput = component.getByLabelText('Search');
      expect(searchInput).toBeTruthy();
      userEvent.type(searchInput, 'search term here{enter}');

      const expectedEmit = { pageIndex: 0, itemsPerPage: 15, sortBy: 'staffNameAsc', searchTerm: 'search term here' };
      expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
    });
  });
});
