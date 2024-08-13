import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TrainingService } from './training.service';
import { environment } from 'src/environments/environment';

describe('TrainingService', () => {
  let service: TrainingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TrainingService],
    });
    service = TestBed.inject(TrainingService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTrainingByStatus', () => {
    it('should call the endpoint for getting training by status', async () => {
      service.getAllTrainingByStatus('mock-uid', 'expired').subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/mock-uid/trainingAndQualifications/expired`,
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getMissingMandatoryTraining', () => {
    it('should call the endpoint for getting missing mandatory training', async () => {
      service.getMissingMandatoryTraining('mock-uid').subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/mock-uid/trainingAndQualifications/missing-training`,
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('trainingCategorySelectedForTrainingRecord', () => {
    it('should return the training category selected for training record', () => {
      service.setTrainingCategorySelectedForTrainingRecord({
        id: 1,
        category: 'Activity provision, wellbeing',
        seq: 0,
        trainingCategoryGroup: 'Care skills and knowledge',
      });

      expect(service.getTrainingCategorySelectedForTrainingRecord()).toEqual({
        id: 1,
        category: 'Activity provision, wellbeing',
        seq: 0,
        trainingCategoryGroup: 'Care skills and knowledge',
      });
    });

    it('should clear trainingCategorySelectedForTrainingRecord', () => {
      service.setTrainingCategorySelectedForTrainingRecord({
        id: 1,
        category: 'Activity provision, wellbeing',
        seq: 0,
        trainingCategoryGroup: 'Care skills and knowledge',
      });

      service.clearTrainingCategorySelectedForTrainingRecord();

      expect(service.getTrainingCategorySelectedForTrainingRecord()).toBeNull();
    });
  });

  describe('isSelectStaffChange', () => {
    it('sets isSelectStaffChange when true is passed', async () => {
      service.setIsSelectStaffChange(true);

      expect(service.getIsSelectStaffChange()).toEqual(true);
    });

    it('sets isSelectStaffChange when false is passed', async () => {
      service.setIsSelectStaffChange(false);

      expect(service.getIsSelectStaffChange()).toEqual(false);
    });

    it('clears isSelectStaffChange', async () => {
      service.clearIsSelectStaffChange();

      expect(service.getIsSelectStaffChange()).toBe(null);
    });
  });
});
