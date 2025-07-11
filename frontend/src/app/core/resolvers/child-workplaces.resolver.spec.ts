import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { ChildWorkplacesResolver } from './child-workplaces.resolver';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';

describe('ChildWorkplacesResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ChildWorkplacesResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
      ],
    });

    const resolver = TestBed.inject(ChildWorkplacesResolver);

    const workplaceService = TestBed.inject(WorkplaceService) as WorkplaceService;
    const establishmentService = TestBed.inject(EstablishmentService);
    spyOn(establishmentService, 'getChildWorkplaces').and.callThrough();

    return {
      resolver,
      establishmentService,
      workplaceService,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getChildWorkplaces with id from establishmentService and initial pagination params', () => {
    const { resolver, establishmentService } = setup();

    const primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
    const queryParams = { pageIndex: 0, itemsPerPage: 12, getPendingWorkplaces: true, sortBy: null };

    resolver.resolve();

    expect(establishmentService.getChildWorkplaces).toHaveBeenCalledWith(primaryWorkplaceUid, queryParams);
  });

  it('should call getChildWorkplaces with id from establishmentService, initial pagination params and sort value', () => {
    const { resolver, establishmentService, workplaceService } = setup();

    const sortKey = 'workplaceToCheckAsc';

    workplaceService.setAllWorkplacesSortValue(sortKey);
    const primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
    const queryParams = { pageIndex: 0, itemsPerPage: 12, getPendingWorkplaces: true, sortBy: sortKey };

    resolver.resolve();

    expect(establishmentService.getChildWorkplaces).toHaveBeenCalledWith(primaryWorkplaceUid, queryParams);
  });
});
