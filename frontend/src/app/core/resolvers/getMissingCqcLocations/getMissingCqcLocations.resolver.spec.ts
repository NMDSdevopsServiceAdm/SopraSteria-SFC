import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { GetMissingCqcLocationsResolver } from './getMissingCqcLocations.resolver';

describe('GetMissingCqcLocationsResolver', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        GetMissingCqcLocationsResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });
    const resolver = TestBed.inject(GetMissingCqcLocationsResolver);
    const route = TestBed.inject(ActivatedRoute);

    const establishmentService = TestBed.inject(EstablishmentService);

    return { resolver, route, establishmentService };
  };

  it('should be created', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getMissingCqcLocations', async () => {
    const { resolver, route, establishmentService } = await setup();
    const getMissingCqcLocationsSpy = spyOn(establishmentService, 'getMissingCqcLocations').and.callThrough();
    resolver.resolve(route.snapshot);

    expect(getMissingCqcLocationsSpy).toHaveBeenCalledWith({
      locationId: '1-11111111',
      uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8de',
      id: 0,
      childWorkplacesCount: 2,
    });
  });
});
