import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { Worker } from '@core/model/worker.model';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewDashboardHeaderComponent } from '../../../shared/components/new-dashboard-header/dashboard-header.component';
import { ViewSubsidiaryStaffRecordsComponent } from './view-subsidiary-staff-records.component';

describe('ViewSubsidiaryStaffRecordsComponent', () => {
  const setup = async (workers = [workerBuilder()] as Worker[]) => {
    const workerArr = workers;
    const establishment = establishmentBuilder() as Establishment;
    const role = Roles.Edit;
    const { fixture, getByTestId, queryByTestId } = await render(ViewSubsidiaryStaffRecordsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, role),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, false),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment,
                workers: {
                  workers: workerArr as Worker[],
                  workerCount: workerArr.length,
                },
              },
              queryParamMap: { get: () => null },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
      declarations: [NewDashboardHeaderComponent],
    });

    const component = fixture.componentInstance;

    const workerService = TestBed.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setAddStaffRecordInProgress');

    return {
      component,
      getByTestId,
      queryByTestId,
      workerSpy,
      fixture,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the no staff records section if there are no staff records', async () => {
    const { getByTestId, queryByTestId } = await setup([]);

    expect(getByTestId('no-staff-records')).toBeTruthy();
    expect(queryByTestId('staff-records')).toBeFalsy();
  });

  it('should show the staff records section if there are staff records', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('staff-records')).toBeTruthy();
    expect(queryByTestId('no-staff-records')).toBeFalsy();
  });

  it('should call setAddStaffRecordInProgress when initialising component', async () => {
    const { component, workerSpy } = await setup();

    component.ngOnInit();
    expect(workerSpy).toHaveBeenCalledWith(false);
  });

  describe('staffLastUpdatedDate', () => {
    it('should set staffLastUpdatedDate as worker updated date when only one worker', async () => {
      const workers = [workerBuilder()] as Worker[];

      const { component, workerSpy } = await setup(workers);
      expect(component.staffLastUpdatedDate).toBe(workers[0].updated);
    });

    it('should set staffLastUpdatedDate as worker with latest updated date when more than one worker', async () => {
      const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      workers[0].updated = '2024-05-01T06:50:45.882Z';
      workers[1].updated = '2024-05-08T06:50:45.882Z';
      workers[2].updated = '2024-05-03T11:50:45.882Z';

      const { component } = await setup(workers);
      expect(component.staffLastUpdatedDate).toBe(workers[1].updated);
    });

    it('should not set staffLastUpdatedDate when no workers', async () => {
      const workers = [] as Worker[];

      const { component } = await setup(workers);
      expect(component.staffLastUpdatedDate).toBeFalsy();
    });
  });
});