import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

import { WorkerReasonsForLeavingResolver } from './worker-reasons-for-leaving.resolver';

describe('WorkerReasonsForLeavingResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        WorkerReasonsForLeavingResolver,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
      ],
    });

    const resolver = TestBed.inject(WorkerReasonsForLeavingResolver);

    const workerService = TestBed.inject(WorkerService);
    const getLeaveReasonsSpy = spyOn(workerService, 'getLeaveReasons').and.callThrough();

    return {
      resolver,
      getLeaveReasonsSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getLeaveReasons in the worker service', () => {
    const { resolver, getLeaveReasonsSpy } = setup();

    resolver.resolve();
    expect(getLeaveReasonsSpy).toHaveBeenCalled();
  });
});
