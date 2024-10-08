import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';

import { GetMissingCqcLocationsResolver } from './getMissingCqcLocations.resolver';

describe('GetMissingCqcLocationsResolver', () => {
  const mockWorkplace = {
    provId: '1-11111111',
    uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8de',
    id: 1234,
  };

  const setup = () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        GetMissingCqcLocationsResolver,
        {
          provide: EstablishmentService,
          useValue: {
            primaryWorkplace: mockWorkplace,
            async getMissingCqcLocations() {
              of(null);
            },
          },
        },
      ],
    });
    const resolver = TestBed.inject(GetMissingCqcLocationsResolver);
    const establishmentService = TestBed.inject(EstablishmentService);

    return { resolver, establishmentService };
  };

  it('should be created', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getMissingCqcLocations', async () => {
    const { resolver, establishmentService } = await setup();
    const getMissingCqcLocationsSpy = spyOn(establishmentService, 'getMissingCqcLocations').and.returnValue(of(null));
    resolver.resolve();

    expect(getMissingCqcLocationsSpy).toHaveBeenCalledWith({
      provId: mockWorkplace.provId,
      uid: mockWorkplace.uid,
      id: mockWorkplace.id,
    });
  });
});
