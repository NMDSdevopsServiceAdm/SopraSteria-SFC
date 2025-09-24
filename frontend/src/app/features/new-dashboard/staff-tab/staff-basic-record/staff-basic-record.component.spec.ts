import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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

import { StaffBasicRecord } from './staff-basic-record.component';

describe('StaffBasicRecord', () => {
  async function setup() {
    const establishment = establishmentBuilder() as Establishment;
    const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

    const component = await render(StaffBasicRecord, {
      imports: [SharedModule, RouterModule, RouterTestingModule],

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
              data: {
                establishment: establishment,
                workers: { workersNotCompleted: workers },
              },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    return {
      router,
      component,
      workers,
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

  describe('getWorkerRecordPath', () => {
    it('navigates to the staff record summary ', async () => {
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