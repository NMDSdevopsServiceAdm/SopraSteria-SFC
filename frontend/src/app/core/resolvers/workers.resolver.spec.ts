import { of } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { SortByService } from '@core/services/sort-by.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockSortByService } from '@core/test-utils/MockSortByService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

import { WorkersResolver } from './workers.resolver';

describe('WorkersResolver', () => {
  function setup(overrides: any = {}) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WorkersResolver,
        {
          provide: SortByService,
          useFactory: MockSortByService.factory(overrides),
          deps: [Router, TabsService],
        },
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
          useFactory: MockPermissionsService.factory(overrides.permissions ?? ['canViewListOfWorkers']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ establishmentuid: overrides.idInParams ?? null }),
              data: { workerPagination: overrides.workerPagination ?? true },
            },
          },
        },
      ],
    });

    const resolver = TestBed.inject(WorkersResolver);
    const route = TestBed.inject(ActivatedRoute);

    const workerService = TestBed.inject(WorkerService);
    const getAllWorkersSpy = spyOn(workerService, 'getAllWorkers').and.callThrough();

    const sortByService = TestBed.inject(SortByService) as SortByService;
    const sortByServiceSpy = spyOn(sortByService, 'returnLocalStorageForSort').and.callThrough();

    return {
      resolver,
      route,
      workerService,
      getAllWorkersSpy,
      sortByServiceSpy,
    };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getAllWorkers with id from establishmentService and workerPagination params when no uid in params and workerPagination true', () => {
    const { resolver, route, workerService } = setup();

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';
    const queryParams = { pageIndex: 0, itemsPerPage: 15, sortBy: null };

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith(idFromEstablishmentService, queryParams);
  });

  it('should call getAllWorkers with id from establishmentService and empty object when workerPagination is false and no uid in params', () => {
    const overrides = { idInParams: null, permissions: ['canViewListOfWorkers'], workerPagination: false };

    const { resolver, route, workerService } = setup(overrides);

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith(idFromEstablishmentService, {});
  });

  it('should call getAllWorkers with id from params and workerPagination params when when id exists and workerPagination true', () => {
    const overrides = { idInParams: 'paramUid' };
    const { resolver, route, workerService } = setup(overrides);

    const queryParams = { pageIndex: 0, itemsPerPage: 15, sortBy: null };
    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith('paramUid', queryParams);
  });

  it('should call getAllWorkers with id from params and empty object when when id exists and workerPagination false', () => {
    const overrides = { idInParams: 'paramUid', permissions: ['canViewListOfWorkers'], workerPagination: false };

    const { resolver, route, workerService } = setup(overrides);

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).toHaveBeenCalledWith('paramUid', {});
  });

  it('should not call getAllWorkers when workplace does not have canViewListOfWorkers permission', () => {
    const overrides = { idInParams: 'paramUid', permissions: [] };
    const { resolver, route, workerService } = setup(overrides);

    resolver.resolve(route.snapshot);

    expect(workerService.getAllWorkers).not.toHaveBeenCalled();
  });

  it('should return the training last updated value when it is greater than the qualifications last updated value', () => {
    const overrides = { idInParams: 'paramUid' };

    const { resolver } = setup(overrides);

    const training = new Date('2020/04/10').toISOString();
    const qualifications = new Date('2019/02/25').toISOString();

    const result = resolver.getLastUpdatedTrainingOrQualifications(training, qualifications);

    expect(result).toEqual(training);
  });

  it('should return the qualification last updated value when it is greater than the training last updated value', () => {
    const overrides = { idInParams: 'paramUid' };

    const { resolver } = setup(overrides);

    const qualifications = new Date('2020/04/10').toISOString();
    const training = new Date('2019/02/25').toISOString();

    const result = resolver.getLastUpdatedTrainingOrQualifications(training, qualifications);

    expect(result).toEqual(qualifications);
  });

  it('should return nothing when there is not a qualification or training last updated value', () => {
    const overrides = { idInParams: 'paramUid' };

    const { resolver } = setup(overrides);

    const training = null;
    const qualifications = null;

    const result = resolver.getLastUpdatedTrainingOrQualifications(training, qualifications);

    expect(result).toBeFalsy();
  });

  it('should get all workers with the sort value from returnLocalStorageForSort if there is a value ', async () => {
    const overrides = {
      idInParams: 'paramUid',
      previousUrl: '/workplace/workplace-uid/staff-record/staff-uid/staff-record-summary',
      localStorageValuesForSort: {
        staffSummarySortValue: 'lastUpdateNewest',
        staffSummarySearchTerm: 'Ma',
        staffSummaryIndex: '0',
      },
    };

    const { resolver, route, workerService, sortByServiceSpy } = setup(overrides);
    const sortByValue = 'lastUpdateNewest';
    const queryParams = { pageIndex: 0, itemsPerPage: 15, sortBy: sortByValue, searchTerm: 'Ma' };

    resolver.resolve(route.snapshot);

    expect(sortByServiceSpy).toHaveBeenCalled();

    expect(workerService.getAllWorkers).toHaveBeenCalledWith('paramUid', queryParams);
  });

  it('should get all workers with the sort value as null if there is no values from returnLocalStorageForSort', async () => {
    const overrides = {
      idInParams: 'paramUid',
      previousUrl: '/workplace/workplace-uid/training-and-qualifications-record/staff-uid/training',
    };

    const { resolver, route, workerService, sortByServiceSpy } = setup(overrides);

    const queryParams = { pageIndex: 0, itemsPerPage: 15, sortBy: null };

    resolver.resolve(route.snapshot);

    expect(sortByServiceSpy).toHaveBeenCalled();
    expect(workerService.getAllWorkers).toHaveBeenCalledWith('paramUid', queryParams);
  });

  it('should set a property "listOfAllWorkers" in the resolved data', async () => {
    const mockListOfAllWorkers = ['worker1', 'worker2', 'worker3'] as never as Worker[];
    const { resolver, route, getAllWorkersSpy } = setup({});
    getAllWorkersSpy.and.returnValue(of({ workers: mockListOfAllWorkers, workerCount: 3 }));

    const returnedObservable = resolver.resolve(route.snapshot);
    const resolvedData = await returnedObservable.toPromise();

    expect(resolvedData.listOfAllWorkers).toEqual(mockListOfAllWorkers);
  });
});
