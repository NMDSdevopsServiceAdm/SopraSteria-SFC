import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { MissingMandatoryTrainingResolver } from './missing-mandatory-training.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('MissingMandatoryTrainingResolver', () => {
  const workplaceUid = 'mock-uid';
  function setup() {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        MissingMandatoryTrainingResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: 'mock-uid' }) },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
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
