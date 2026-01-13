import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { TrainingService } from './training.service';
import { provideHttpClient } from '@angular/common/http';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { Worker } from '@core/model/worker.model';
import { DateUtil } from '@core/utils/date-util';

describe('TrainingService', () => {
  let service: TrainingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [TrainingService, provideHttpClient(), provideHttpClientTesting()],
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

  describe('setSelectedTrainingCategory', () => {
    it('should update the training category selected for training record', () => {
      service.setSelectedTrainingCategory({
        id: 1,
        category: 'Activity provision, wellbeing',
        seq: 0,
        trainingCategoryGroup: 'Care skills and knowledge',
      });

      expect(service.selectedTraining.trainingCategory).toEqual({
        id: 1,
        category: 'Activity provision, wellbeing',
        seq: 0,
        trainingCategoryGroup: 'Care skills and knowledge',
      });
    });
  });

  describe('clearSelectedTrainingCategory', () => {
    it('should clear the training category selected for training record', () => {
      service.setSelectedTrainingCategory({
        id: 1,
        category: 'Activity provision, wellbeing',
        seq: 0,
        trainingCategoryGroup: 'Care skills and knowledge',
      });

      service.clearSelectedTrainingCategory();

      expect(service.selectedTraining.trainingCategory).toBeNull();
    });
  });

  describe('selectedStaff', () => {
    it('should update and get the selectedStaff', () => {
      const workers = [workerBuilder(), workerBuilder()] as Worker[];
      service.updateSelectedStaff(workers);

      expect(service.getSelectedStaff()).toEqual(workers);
    });

    it('should reset the selectedStaff to an empty array', () => {
      const workers = [workerBuilder(), workerBuilder()] as Worker[];
      service.updateSelectedStaff(workers);
      service.resetSelectedStaff();

      expect(service.getSelectedStaff()).toEqual([]);
    });
  });

  describe('isSelectStaffChange', () => {
    it('sets isSelectStaffChange when true is passed', async () => {
      service.setUpdatingSelectedStaffForMultipleTraining(true);

      expect(service.getUpdatingSelectedStaffForMultipleTraining()).toEqual(true);
    });

    it('sets isSelectStaffChange when false is passed', async () => {
      service.setUpdatingSelectedStaffForMultipleTraining(false);

      expect(service.getUpdatingSelectedStaffForMultipleTraining()).toEqual(false);
    });

    it('clears isSelectStaffChange', async () => {
      service.clearUpdatingSelectedStaffForMultipleTraining();

      expect(service.getUpdatingSelectedStaffForMultipleTraining()).toBe(null);
    });
  });

  describe('isTrainingCourseSelected', () => {
    it('sets isTrainingCourseSelected when a boolean is passed', async () => {
      service.setIsTrainingCourseSelected(true);

      expect(service.getIsTrainingCourseSelected()).toEqual(true);
    });

    it('clears isSelectStaffChange', async () => {
      service.clearIsTrainingCourseSelected();

      expect(service.getIsTrainingCourseSelected()).toBe(null);
    });
  });

  describe('selectedTrainingCourse', () => {
    it('sets isTrainingCourseSelected when a boolean is passed', async () => {
      const trainingCourse = {
        id: 1,
        uid: 'uid-1',
        trainingCategoryId: 1,
        name: 'Care skills and knowledge',
        trainingCategoryName: 'Activity provision, wellbeing',
        accredited: YesNoDontKnow.Yes,
        deliveredBy: DeliveredBy.InHouseStaff,
        externalProviderName: null,
        howWasItDelivered: HowWasItDelivered.FaceToFace,
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      };

      service.setSelectedTrainingCourse(trainingCourse);

      expect(service.getSelectedTrainingCourse()).toEqual(trainingCourse);
    });

    it('clears isSelectStaffChange', async () => {
      service.clearSelectedTrainingCourse();

      expect(service.getSelectedTrainingCourse()).toBe(null);
    });
  });

  describe('Course Completion Date', () => {
    it('sets and gets the completion date', async () => {
      const date = new Date('2025-10-15');
      service.setCourseCompletionDate(date);

      expect(service.getCourseCompletionDate()).toEqual(date);
    });

    it('clears the set date', async () => {
      service.clearCourseCompletionDate();

      expect(service.getCourseCompletionDate()).toEqual(null);
    });
  });

  describe('Notes', () => {
    it('sets and gets the notes', async () => {
      service.setNotes('Hello, world!');

      expect(service.getNotes()).toEqual('Hello, world!');
    });

    it('clears the notes', async () => {
      service.clearNotes();

      expect(service.getNotes()).toEqual(null);
    });
  });

  describe('fillInExpiryDate', () => {
    let trainingRecord = {
      trainingCategory: { id: 2 },
      title: 'Basic safeguarding for support staff',
      trainingCategoryName: 'Safeguarding adults',
      accredited: 'Yes',
      deliveredBy: DeliveredBy.ExternalProvider,
      externalProviderName: 'Care skills academy',
      otherTrainingProviderName: 'Care skills academy',
      howWasItDelivered: HowWasItDelivered.ELearning,
      validityPeriodInMonth: 12,
      completed: '2024-08-21',
      notes: null,
      trainingCourseFK: 2,
    };

    let completedDate = DateUtil.toDayjs({ day: 21, month: 8, year: 2024 });

    it('returns the training record with an expiry date', async () => {
      const sentTrainingRecord = { ...trainingRecord };
      const returnedTrainingRecord = {
        ...trainingRecord,
        expires: '2025-08-21',
      };
      const response = service.fillInExpiryDate(sentTrainingRecord, completedDate);

      expect(response).toEqual(returnedTrainingRecord);
    });

    it('returns an unchanged training record when there is no completed date', async () => {
      const sentTrainingRecord = { ...trainingRecord, completed: null };

      const returnedTrainingRecord = {
        ...trainingRecord,
        completed: null,
      };

      const response = service.fillInExpiryDate(sentTrainingRecord, null);

      expect(response).toEqual(returnedTrainingRecord);
    });

    it('returns an unchanged training record when there is no value in validityPeriodInMonth and doesNotExpire is true', async () => {
      const sentTrainingRecord = {
        ...trainingRecord,
        completed: '2024-08-21',
        validityPeriodInMonth: null,
        doesNotExpire: true,
      };

      const returnedTrainingRecord = {
        ...trainingRecord,
        completed: '2024-08-21',
        validityPeriodInMonth: null,
        doesNotExpire: true,
      };

      const response = service.fillInExpiryDate(sentTrainingRecord, completedDate);

      expect(response).toEqual(returnedTrainingRecord);
    });
  });
});
