import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingCategoryService } from '@core/test-utils/MockTrainingCategoriesService';

import { TrainingRecordsForCategoryResolver } from './training-records-for-category.resolver';

describe('TrainingRecordsForCategoryResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        TrainingRecordsForCategoryResolver,
        {
          provide: TrainingCategoryService,
          useClass: MockTrainingCategoryService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ categoryId: '1' }) },
          },
        },
      ],
    });

    const resolver = TestBed.inject(TrainingRecordsForCategoryResolver);
    const route = TestBed.inject(ActivatedRoute);

    const trainingCategoryService = TestBed.inject(TrainingCategoryService);
    spyOn(trainingCategoryService, 'getTrainingCategory').and.callThrough();

    const establishmentService = TestBed.inject(EstablishmentService);

    return {
      resolver,
      route,
      trainingCategoryService,
      establishmentService,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call the getTrainingCategory function', () => {
    const { resolver, route, trainingCategoryService, establishmentService } = setup();

    const establishmentId = establishmentService.primaryWorkplace.id;

    resolver.resolve(route.snapshot);
    expect(trainingCategoryService.getTrainingCategory).toHaveBeenCalledWith(establishmentId, 1, {
      pageIndex: 0,
      itemsPerPage: 15,
      sortBy: 'trainingExpired',
    });
  });
});
