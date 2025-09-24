import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { WorkplaceResolver } from './workplace.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('WorkplaceResolver', () => {
  function setup(overrides: any = {}) {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        WorkplaceResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            data: { withFunding: overrides.withFunding ?? undefined },
            paramMap: convertToParamMap({ establishmentuid: overrides.idInParams ?? null }),
          },
        },

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(WorkplaceResolver);
    const route = TestBed.inject(ActivatedRouteSnapshot);

    const establishmentService = TestBed.inject(EstablishmentService);
    const getEstablishmentSpy = spyOn(establishmentService, 'getEstablishment').and.callThrough();

    return {
      resolver,
      route,
      getEstablishmentSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getEstablishment with id from establishmentService and wdf param set to false when no uid in params and no withFunding in data', () => {
    const { resolver, route, getEstablishmentSpy } = setup();

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';

    resolver.resolve(route);

    expect(getEstablishmentSpy).toHaveBeenCalledWith(idFromEstablishmentService, false);
  });

  it('should call getEstablishment with uid from establishmentService and wdf param set to true when no uid in params and withFunding in data', () => {
    const { resolver, route, getEstablishmentSpy } = setup({ withFunding: true });

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';

    resolver.resolve(route);

    expect(getEstablishmentSpy).toHaveBeenCalledWith(idFromEstablishmentService, true);
  });

  it('should call getEstablishment with uid in params and wdf param set to false when uid in params and no withFunding in data', () => {
    const idInParams = 'abc1234324329uwsad';
    const { resolver, route, getEstablishmentSpy } = setup({ idInParams });

    resolver.resolve(route);

    expect(getEstablishmentSpy).toHaveBeenCalledWith(idInParams, false);
  });

  it('should call getEstablishment with uid in params and wdf param set to true when uid in params and withFunding in data', () => {
    const idInParams = 'abc1234324329uwsad';
    const { resolver, route, getEstablishmentSpy } = setup({ idInParams, withFunding: true });

    resolver.resolve(route);

    expect(getEstablishmentSpy).toHaveBeenCalledWith(idInParams, true);
  });
});
