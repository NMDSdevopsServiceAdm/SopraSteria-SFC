import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { WorkerHasAnyTrainingOrQualificationsResolver } from './worker-has-any-training-or-qualifications.resolver';
import { WorkerService } from '@core/services/worker.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

describe('WorkerHasAnyTrainingOrQualificationsResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WorkerHasAnyTrainingOrQualificationsResolver,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: 'mock-uid', id: 'mock-id' }) },
          },
        },
      ],
    });

    const resolver = TestBed.inject(WorkerHasAnyTrainingOrQualificationsResolver);
    const route = TestBed.inject(ActivatedRoute);

    const workerService = TestBed.inject(WorkerService);
    const workerServiceSpy = spyOn(workerService, 'workerHasAnyTrainingOrQualifications').and.returnValue(of(null));

    return {
      resolver,
      route,
      workerService,
      workerServiceSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call workerHasAnyTrainingOrQualifications', () => {
    const { resolver, route, workerServiceSpy } = setup();

    resolver.resolve(route.snapshot);

    expect(workerServiceSpy).toHaveBeenCalled();
  });
});
