import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { ChildWorkplacesResolver } from './child-workplaces.resolver';

describe('ChildWorkplacesResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        ChildWorkplacesResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const resolver = TestBed.inject(ChildWorkplacesResolver);

    const establishmentService = TestBed.inject(EstablishmentService);
    spyOn(establishmentService, 'getChildWorkplaces').and.callThrough();

    return {
      resolver,
      establishmentService,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getChildWorkplaces with id from establishmentService and initial pagination params', () => {
    const { resolver, establishmentService } = setup();

    const primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
    const queryParams = { pageIndex: 0, itemsPerPage: 12 };

    resolver.resolve();

    expect(establishmentService.getChildWorkplaces).toHaveBeenCalledWith(primaryWorkplaceUid, queryParams);
  });
});
