import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';

import { WorkersMainJobRolesResolver } from './workers-main-job-roles.resolver';

describe('WorkersMainJobRolesResolver', () => {
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
        EstablishmentService,
      ],
    });
    const resolver = TestBed.inject(WorkersMainJobRolesResolver);
    const establishmentService = TestBed.inject(EstablishmentService) as EstablishmentService;
    const route = TestBed.inject(ActivatedRoute);
    return { resolver, establishmentService, route };
  };

  it('should be created', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  const mockJobRoles = [
    {
      id: 10,
      title: 'Care worker',
    },
    {
      id: 25,
      title: 'Senior care worker',
    },
  ];

  it('should call the getMainJobRoleForAllWorkers method in worker service', async () => {
    const { resolver, establishmentService, route } = setup();
    const getMainJobRoleForAllWorkersSpy = spyOn(establishmentService, 'getMainJobRoleForAllWorkers').and.returnValue(
      of({
        mainJobRoles: mockJobRoles,
      }),
    );
    const resolvedData = await resolver.resolve(route.snapshot).toPromise();

    expect(getMainJobRoleForAllWorkersSpy).toHaveBeenCalledWith('mock-uid');
    expect(resolvedData).toEqual(mockJobRoles);
  });
});
