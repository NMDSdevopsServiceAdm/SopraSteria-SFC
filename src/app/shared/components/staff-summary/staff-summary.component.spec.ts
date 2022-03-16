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
import { render } from '@testing-library/angular';
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
      },
    });

    const injector = getTestBed();
    const workerService = injector.inject(WorkerService) as WorkerService;
    const getAllWorkersSpy = spyOn(workerService, 'getAllWorkers').and.returnValue(
      of({ workers: [workerBuilder(), workerBuilder(), workerBuilder()], workerCount: 3 }),
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

  it('should put staff meeting WDF at top of table when sorting by WDF requirements (meeting)', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.workers[2].wdfEligible = true;

    component.fixture.componentInstance.sortByColumn('2_meeting');
    const workers = component.fixture.componentInstance.workers;
    component.fixture.detectChanges();

    expect(workers[0].wdfEligible).toEqual(true);
    expect(workers[1].wdfEligible).toEqual(false);
    expect(workers[2].wdfEligible).toEqual(false);
  });

  it('should put staff meeting WDF at bottom of table when sorting by WDF requirements (not meeting)', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.workers[1].wdfEligible = true;

    component.fixture.componentInstance.sortByColumn('2_not_meeting');
    const workers = component.fixture.componentInstance.workers;
    component.fixture.detectChanges();

    expect(workers[0].wdfEligible).toEqual(false);
    expect(workers[1].wdfEligible).toEqual(false);
    expect(workers[2].wdfEligible).toEqual(true);
  });

  describe('Calling getAllWorkers when using pagination', () => {
    it('should call getAllWorkers on load with pageIndex 0 and noOfItemsOnPage 15', async () => {
      const { component, getAllWorkersSpy } = await setup();

      await component.fixture.whenStable();

      const establishmentUid = component.fixture.componentInstance.workplace.uid;
      const paginationEmission = { pageIndex: 0, noOfItemsOnPage: 15 };

      expect(getAllWorkersSpy.calls.mostRecent().args[0]).toEqual(establishmentUid);
      expect(getAllWorkersSpy.calls.mostRecent().args[1]).toEqual(paginationEmission);
    });
  });
});
