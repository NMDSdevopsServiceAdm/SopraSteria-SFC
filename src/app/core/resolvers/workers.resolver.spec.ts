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

import { WorkersResolver } from './workers.resolver';

describe('WorkersResolver', () => {
  function setup(idInParams = null, permissions = ['canViewListOfWorkers']) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        WorkersResolver,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ establishmentuid: idInParams }) } },
        },
      ],
    });

    const resolver = TestBed.inject(WorkersResolver);
    const route = TestBed.inject(ActivatedRoute);

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'getAllWorkers').and.callThrough();

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

  it('should call getAllWorkers with id from establishmentService when no uid in params', () => {
    const { resolver, route, workerService } = setup();

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';
    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith(idFromEstablishmentService);
  });

  it('should call getAllWorkers with id from params when it exists', () => {
    const { resolver, route, workerService } = setup('paramUid');

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith('paramUid');
  });

  it('should not call getAllWorkers when workplace does not have canViewListOfWorkers permission', () => {
    const { resolver, route, workerService } = setup('paramUid', []);

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).not.toHaveBeenCalled();
  });
});
