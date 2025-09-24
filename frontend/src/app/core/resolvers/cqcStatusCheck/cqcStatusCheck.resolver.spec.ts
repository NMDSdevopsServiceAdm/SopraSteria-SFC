import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { of } from 'rxjs';

import { CqcStatusCheckResolver } from './cqcStatusCheck.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('CqcStatusCheckResolver', () => {
  const setup = (establishmentuid = null) => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        CqcStatusCheckResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ establishmentuid }) } },
        },

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(CqcStatusCheckResolver);
    const route = TestBed.inject(ActivatedRoute);

    const establishmentService = TestBed.inject(EstablishmentService);
    const getCqcRegistrationStatusSpy = spyOn(establishmentService, 'getCQCRegistrationStatus').and.callFake(() =>
      of({ cqcStatusMatch: false }),
    );

    return { resolver, establishmentService, route, establishmentuid, getCqcRegistrationStatusSpy };
  };

  it('should be created', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getEstablishment with establishment ID in service when no uid in params', async () => {
    const { resolver, establishmentService, route, getCqcRegistrationStatusSpy } = await setup();
    const establishment = {
      locationId: '1-11111111',
      postcode: 'ABC123',
      mainService: { name: 'Care' },
    } as Establishment;

    const getEstablishmentSpy = spyOn(establishmentService, 'getEstablishment').and.callFake(() => of(establishment));

    resolver.resolve(route.snapshot).subscribe(() => {
      expect(getEstablishmentSpy).toHaveBeenCalledWith(establishmentService.establishmentId);

      expect(getCqcRegistrationStatusSpy).toHaveBeenCalledWith(establishment.locationId, {
        postcode: establishment.postcode,
        mainService: establishment.mainService.name,
      });
    });
  });

  it('should call getCQCRegistrationStatus when workplace has location ID', async () => {
    const establishmentuid = 'ab131231dsa2321321a';
    const { resolver, establishmentService, route, getCqcRegistrationStatusSpy } = await setup(establishmentuid);
    const establishment = {
      locationId: '1-11111111',
      postcode: 'ABC123',
      mainService: { name: 'Care' },
    } as Establishment;

    const getEstablishmentSpy = spyOn(establishmentService, 'getEstablishment').and.callFake(() => of(establishment));

    resolver.resolve(route.snapshot).subscribe(() => {
      expect(getEstablishmentSpy).toHaveBeenCalledWith(establishmentuid);

      expect(getCqcRegistrationStatusSpy).toHaveBeenCalledWith(establishment.locationId, {
        postcode: establishment.postcode,
        mainService: establishment.mainService.name,
      });
    });
  });

  it('should not call getCQCRegistrationStatus when workplace does not have location ID', async () => {
    const { resolver, establishmentService, route, establishmentuid, getCqcRegistrationStatusSpy } = await setup();
    const establishment = {
      locationId: null,
      postcode: 'ABC123',
      mainService: { name: 'Care' },
    } as Establishment;

    spyOn(establishmentService, 'getEstablishment').and.callFake(() => of(establishment));

    resolver.resolve(route.snapshot).subscribe(() => {
      expect(getCqcRegistrationStatusSpy).not.toHaveBeenCalled();
    });
  });
});
