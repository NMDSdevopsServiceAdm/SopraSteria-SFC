import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

import { WorkersWithPayDataResolver } from './workers-with-pay-data.resolver';

fdescribe('WorkersWithPayDataResolver', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: 'mock-uid' }) },
          },
        },
        WorkerService,
      ],
    });
    const resolver = TestBed.inject(WorkersWithPayDataResolver);
    const workerService = TestBed.inject(WorkerService) as WorkerService;
    const route = TestBed.inject(ActivatedRoute);
    return { resolver, workerService, route };
  };

  it('should be created', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call the getworkersWithPayData method in worker service', () => {
    const { resolver, workerService, route } = setup();
    const getWorkersWithPayDataSpy = spyOn(workerService, 'getWorkersWithPayData').and.returnValue(
      of({ count: 0, workers: [] }),
    );
    resolver.resolve(route.snapshot);

    expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mock-uid');
  });
});
