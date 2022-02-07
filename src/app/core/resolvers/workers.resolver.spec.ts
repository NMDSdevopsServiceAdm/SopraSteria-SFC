import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

import { WorkersResolver } from './workers.resolver';

describe('WorkersResolver', () => {
  function setup(idInParams = null) {
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
});
