import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { RegisteredNursesResolver } from './registered-nurses.resolver';
import { WorkerService } from '@core/services/worker.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

describe('RegisteredNursesResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        RegisteredNursesResolver,
        WorkerService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: 'mock-uid' }) },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(RegisteredNursesResolver);
    const workerService = TestBed.inject(WorkerService);

    const getAllRegisteredNursesSpy = spyOn(workerService, 'getAllRegisteredNurses').and.returnValue(of([]));
    const route = TestBed.inject(ActivatedRoute);

    return {
      route,
      resolver,
      workerService,
      getAllRegisteredNursesSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getAllRegisteredNurses', () => {
    const { resolver, route, getAllRegisteredNursesSpy } = setup();

    resolver.resolve(route.snapshot);

    expect(getAllRegisteredNursesSpy).toHaveBeenCalledWith('mock-uid');
  });
});
