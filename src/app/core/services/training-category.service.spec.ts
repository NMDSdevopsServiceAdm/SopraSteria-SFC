import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TrainingCategoryService } from './training-category.service';

describe('TrainingCategoryService', () => {
  let service: TrainingCategoryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TrainingCategoryService],
    });
    service = TestBed.inject(TrainingCategoryService);

    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('getTrainingCategory', () => {
    it('should call trainingCategories/establishmentId/trainingCategoryId endpoint with no query params if none are given', async () => {
      const establishmentId = 1034340;
      const trainingCategoryId = 2345;

      service.getTrainingCategory(establishmentId, trainingCategoryId).subscribe();

      const req = http.expectOne(`/api/trainingCategories/${establishmentId}/${trainingCategoryId}`);
      expect(req.request.method).toBe('GET');
    });

    it('should call trainingCategories/establishmentId/trainingCategoryId endpoint with query params if they are given', async () => {
      const establishmentId = 1034340;
      const trainingCategoryId = 2345;
      const queryParams = {
        sortBy: 'staffNameAsc',
        searchTerm: '',
        pageIndex: 1,
        itemsPerPage: 15,
      };

      service.getTrainingCategory(establishmentId, trainingCategoryId, queryParams).subscribe();

      const req = http.expectOne(
        `/api/trainingCategories/${establishmentId}/${trainingCategoryId}?sortBy=staffNameAsc&searchTerm=&pageIndex=1&itemsPerPage=15`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
