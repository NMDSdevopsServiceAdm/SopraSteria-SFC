import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { GetTrainingByStatusResolver } from './get-training-by-status.resolver';

describe('GetTrainingByStatusResolver', () => {
  const workplaceUid = 'mock-uid';
  function setup(status = 'expired') {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        GetTrainingByStatusResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: 'mock-uid' }), data: { training: status } },
          },
        },
      ],
    });

    const resolver = TestBed.inject(GetTrainingByStatusResolver);
    const route = TestBed.inject(ActivatedRoute);

    const trainingService = TestBed.inject(TrainingService);
    spyOn(trainingService, 'getAllTrainingByStatus').and.callThrough();
    return {
      resolver,
      route,
      trainingService,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call the getAllTrainingByStatus with the workplaceUid and expired status', async () => {
    const { resolver, route, trainingService } = await setup();

    const status = 'expired';
    resolver.resolve(route.snapshot);

    expect(trainingService.getAllTrainingByStatus).toHaveBeenCalledWith(workplaceUid, status, {
      pageIndex: 0,
      itemsPerPage: 15,
    });
  });

  it('should call the getAllTrainingByStatus with the workplaceUid and expiring status', async () => {
    const { resolver, route, trainingService } = await setup('expiring');

    const status = 'expiring';
    resolver.resolve(route.snapshot);

    expect(trainingService.getAllTrainingByStatus).toHaveBeenCalledWith(workplaceUid, status, {
      pageIndex: 0,
      itemsPerPage: 15,
    });
  });
});
