import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { MissingMandatoryTrainingResolver } from './missing-mandatory-training.resolver';

describe('MissingMandatoryTrainingResolver', () => {
  const workplaceUid = 'mock-uid';
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        MissingMandatoryTrainingResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: 'mock-uid' }) },
          },
        },
      ],
    });

    const resolver = TestBed.inject(MissingMandatoryTrainingResolver);
    const route = TestBed.inject(ActivatedRoute);

    const trainingService = TestBed.inject(TrainingService);
    spyOn(trainingService, 'getMissingMandatoryTraining').and.callThrough();
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

  it('should call the getMissingMandatoryTraining with the workplaceUid', async () => {
    const { resolver, route, trainingService } = await setup();

    resolver.resolve(route.snapshot);

    expect(trainingService.getMissingMandatoryTraining).toHaveBeenCalledWith(workplaceUid, {
      pageIndex: 0,
      itemsPerPage: 15,
    });
  });
});
