import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

import { TotalStaffRecordsResolver } from './total-staff-records.resolver';

describe('TotalStaffRecordsResolver', () => {
  function setup(idInParams = null, permissions = ['canViewListOfWorkers']) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        TotalStaffRecordsResolver,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ establishmentuid: idInParams }) } },
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
      ],
    });

    const resolver = TestBed.inject(TotalStaffRecordsResolver);
    const route = TestBed.inject(ActivatedRoute);

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'getTotalStaffRecords').and.callThrough();

    return {
      resolver,
      route,
      workerService,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getTotalStaffRecords with uid in establishment service when no uid in params', () => {
    const { resolver, route, workerService } = setup();

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';
    resolver.resolve(route.snapshot);

    expect(workerService.getTotalStaffRecords).toHaveBeenCalledWith(idFromEstablishmentService);
  });

  it('should call getTotalStaffRecords with uid in establishment service when no uid in params', () => {
    const { resolver, route, workerService } = setup('testParamUid');

    resolver.resolve(route.snapshot);

    expect(workerService.getTotalStaffRecords).toHaveBeenCalledWith('testParamUid');
  });

  it('should not call getAllWorkers when workplace does not have canViewListOfWorkers permission', () => {
    const { resolver, route, workerService } = setup('testParamUid', []);

    resolver.resolve(route.snapshot);

    expect(workerService.getTotalStaffRecords).not.toHaveBeenCalled();
  });
});
