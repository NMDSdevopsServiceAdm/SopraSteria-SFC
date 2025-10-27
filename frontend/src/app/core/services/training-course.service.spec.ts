import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TrainingCourseService } from './training-course.service';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';

describe('TrainingCourseService', () => {
  let service: TrainingCourseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TrainingCourseService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const establishmentUid = 'mock-uid';
  const trainingCategoryId = 2345;
  const baseEndpoint = `/api/establishment/${establishmentUid}/trainingCourse`;

  describe('getAllTrainingCourses', () => {
    it('should call GET trainingCourse endpoint', async () => {
      service.getAllTrainingCourses(establishmentUid).subscribe();

      const req = http.expectOne(baseEndpoint);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getTrainingCoursesByCategory', () => {
    it('should call GET trainingCourse endpoint with a trainingCategoryId', async () => {
      service.getTrainingCoursesByCategory(establishmentUid, trainingCategoryId).subscribe();

      const req = http.expectOne(`${baseEndpoint}?trainingCategoryId=${trainingCategoryId}`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('createTrainingCourse', () => {
    it('should call POST trainingCourse endpoint with a trainingCourse as request body', async () => {
      const mockTrainingCourse = {
        trainingCategoryId: 1,
        name: 'Care skills and knowledge',
        accredited: YesNoDontKnow.Yes,
        deliveredBy: DeliveredBy.InHouseStaff,
        externalProviderName: null,
        howWasItDelivered: HowWasItDelivered.FaceToFace,
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      };

      service.createTrainingCourse(establishmentUid, mockTrainingCourse).subscribe();

      const req = http.expectOne(baseEndpoint);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockTrainingCourse);
    });
  });
});
