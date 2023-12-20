import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { CqcStatusCheckResolver } from './cqcStatusCheck.resolver';

describe('CqcStatusCheckResolver', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        CqcStatusCheckResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });
    const resolver = TestBed.inject(CqcStatusCheckResolver);
    const route = TestBed.inject(ActivatedRoute);

    const establishmentService = TestBed.inject(EstablishmentService);

    return { resolver, route, establishmentService };
  };

  it('should be created', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getCQCRegistrationStatus', async () => {
    const { resolver, route, establishmentService } = await setup();
    const getCqcRegistrationStatusSpy = spyOn(establishmentService, 'getCQCRegistrationStatus').and.callThrough();
    resolver.resolve(route.snapshot);

    expect(getCqcRegistrationStatusSpy).toHaveBeenCalledWith('1-11111111', {
      postcode: 'AB1 2CD',
      mainService: 'Care',
    });
  });
});
