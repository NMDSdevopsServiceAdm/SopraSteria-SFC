import { TestBed } from '@angular/core/testing';
import { WorkerService } from '@core/services/worker.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WorkersByJobRoleResolver } from '@core/resolvers/workers-by-job-role.resolver';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';

describe('WorkersByJobRoleResolver', ()=> {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            paramMap: convertToParamMap({ establishmentuid: '123' }),
          },
        },
        provideHttpClient(),
        provideHttpClientTesting,
        WorkersByJobRoleResolver,
        WorkerService
      ]
    });

    const resolver = TestBed.inject(WorkersByJobRoleResolver);
    const route = TestBed.inject(ActivatedRouteSnapshot);

    const workerService = TestBed.inject(WorkerService);
    const getAllWorkersGroupedByJobRoleSpy = spyOn(workerService, 'getAllWorkersGroupedByJobRole');

    return {
      resolver,
      workerService,
      getAllWorkersGroupedByJobRoleSpy,
      route
    };
  }

  it('should be created', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy;
  });

  it('should call the getAllWorkersGroupedByJobRole method', () => {
    const { resolver, route, getAllWorkersGroupedByJobRoleSpy } = setup();
    resolver.resolve(route);

    expect(getAllWorkersGroupedByJobRoleSpy).toHaveBeenCalledWith('123');
  });
});
