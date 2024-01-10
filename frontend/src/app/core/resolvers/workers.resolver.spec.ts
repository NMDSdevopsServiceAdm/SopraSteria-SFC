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
  function setup(idInParams = null, permissions = ['canViewListOfWorkers'], workerPagination = true) {
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
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: idInParams }), data: { workerPagination } },
          },
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

  it('should call getAllWorkers with id from establishmentService and workerPagination params when no uid in params and workerPagination true', () => {
    const { resolver, route, workerService } = setup();

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';
    const queryParams = { pageIndex: 0, itemsPerPage: 15 };

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith(idFromEstablishmentService, queryParams);
  });

  it('should call getAllWorkers with id from establishmentService and empty object when workerPagination is false and no uid in params', () => {
    const { resolver, route, workerService } = setup(null, ['canViewListOfWorkers'], false);

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith(idFromEstablishmentService, {});
  });

  it('should call getAllWorkers with id from params and workerPagination params when when id exists and workerPagination true', () => {
    const { resolver, route, workerService } = setup('paramUid');

    const queryParams = { pageIndex: 0, itemsPerPage: 15 };
    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith('paramUid', queryParams);
  });

  it('should call getAllWorkers with id from params and empty object when when id exists and workerPagination false', () => {
    const { resolver, route, workerService } = setup('paramUid', ['canViewListOfWorkers'], false);

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith('paramUid', {});
  });

  it('should not call getAllWorkers when workplace does not have canViewListOfWorkers permission', () => {
    const { resolver, route, workerService } = setup('paramUid', []);

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).not.toHaveBeenCalled();
  });

  it('should return the training last updated value when it is greater than the qualifications last updated value', () => {
    const { resolver } = setup('paramUid');

    const training = new Date('2020/04/10').toISOString();
    const qualifications = new Date('2019/02/25').toISOString();

    const result = resolver.getLastUpdatedTrainingOrQualifications(training, qualifications);

    expect(result).toEqual(training);
  });

  it('should return the qualification last updated value when it is greater than the training last updated value', () => {
    const { resolver } = setup('paramUid');

    const qualifications = new Date('2020/04/10').toISOString();
    const training = new Date('2019/02/25').toISOString();

    const result = resolver.getLastUpdatedTrainingOrQualifications(training, qualifications);

    expect(result).toEqual(qualifications);
  });

  it('should return nothing when there is not a qualification or training last updated value', () => {
    const { resolver } = setup('paramUid');

    const training = null;
    const qualifications = null;

    const result = resolver.getLastUpdatedTrainingOrQualifications(training, qualifications);

    expect(result).toBeFalsy();
  });
});
