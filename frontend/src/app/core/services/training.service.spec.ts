import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TrainingService } from './training.service';
import { environment } from 'src/environments/environment';

fdescribe('TrainingService', () => {
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

  describe('addCertificateToTraining', () => {
    const mockWorkplaceUid = 'mockWorkplaceUid';
    const mockWorkerUid = 'mockWorkerUid';
    const mockTrainingUid = 'mockTrainingUid';

    const mockUploadFile = new File([''], 'certificate.pdf');
    const mockFileId = 'mockFileId';
    const mockeTagFromS3 = 'mock-eTag';
    const mockSignedUrl = 'http://localhost/mock-signed-url-for-upload/';

    it('should call to backend to retreive a signed url to upload certificate', async () => {
      service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFile).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/training/${mockTrainingUid}/certificate`,
      );
      expect(req.request.method).toBe('POST');
    });

    it('should have request body that contains filename', async () => {
      service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFile).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/training/${mockTrainingUid}/certificate`,
      );

      const expectedRequestBody = { files: [{ filename: 'certificate.pdf' }] };

      expect(req.request.body).toEqual(expectedRequestBody);
    });

    it('should upload the file with the signed url received from backend', async () => {
      service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFile).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/training/${mockTrainingUid}/certificate`,
      );
      req.flush({ files: [{ filename: 'certificate.pdf', signedUrl: mockSignedUrl, fileId: mockFileId }] });

      const reqUploadToS3 = http.expectOne(mockSignedUrl);
      expect(reqUploadToS3.request.method).toBe('PUT');
    });

    xit('should call to backend to confirm upload complete', async () => {
      service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFile).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/training/${mockTrainingUid}/certificate`,
      );
      req.flush({ files: [{ filename: 'certificate.pdf', signedUrl: mockSignedUrl, fileId: mockFileId }] });

      const reqUploadToS3 = http.expectOne(mockSignedUrl);
      reqUploadToS3.flush(null, { headers: { eTag: mockeTagFromS3 } });

      const confirmUploadReq = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/training/${mockTrainingUid}/certificate`,
      );
      const expectedBody = { files: [{ filename: mockUploadFile.name, fileId: mockFileId, etag: mockeTagFromS3 }] };

      expect(confirmUploadReq.request.method).toBe('PUT');
      expect(confirmUploadReq.request.body).toEqual(expectedBody);
    });
  });
});
