import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { TrainingService } from './training.service';

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

    const mockUploadFiles = [new File([''], 'certificate.pdf')];
    const mockFileId = 'mockFileId';
    const mockEtagFromS3 = 'mock-etag';
    const mockSignedUrl = 'http://localhost/mock-signed-url-for-upload';

    const certificateEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/training/${mockTrainingUid}/certificate`;

    it('should call to backend to retreive a signed url to upload certificate', async () => {
      service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFiles).subscribe();

      const signedUrlRequest = http.expectOne(certificateEndpoint);
      expect(signedUrlRequest.request.method).toBe('POST');
    });

    it('should have request body that contains filename', async () => {
      service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFiles).subscribe();

      const signedUrlRequest = http.expectOne(certificateEndpoint);

      const expectedRequestBody = { files: [{ filename: 'certificate.pdf' }] };

      expect(signedUrlRequest.request.body).toEqual(expectedRequestBody);
    });

    it('should upload the file with the signed url received from backend', async () => {
      service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFiles).subscribe();

      const signedUrlRequest = http.expectOne(certificateEndpoint);
      signedUrlRequest.flush({
        files: [{ filename: 'certificate.pdf', signedUrl: mockSignedUrl, fileId: mockFileId }],
      });

      const uploadToS3Request = http.expectOne(mockSignedUrl);
      expect(uploadToS3Request.request.method).toBe('PUT');
      expect(uploadToS3Request.request.body).toEqual(mockUploadFiles[0]);
    });

    it('should call to backend to confirm upload complete', async () => {
      const mockKey = 'abcd/adsadsadvfdv/123dsvf';
      service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFiles).subscribe();

      const signedUrlRequest = http.expectOne(certificateEndpoint);
      signedUrlRequest.flush({
        files: [{ filename: 'certificate.pdf', signedUrl: mockSignedUrl, fileId: mockFileId, key: mockKey }],
      });

      const uploadToS3Request = http.expectOne(mockSignedUrl);
      uploadToS3Request.flush(null, { headers: { etag: mockEtagFromS3 } });

      const confirmUploadRequest = http.expectOne(certificateEndpoint);
      const expectedconfirmUploadReqBody = {
        files: [{ filename: mockUploadFiles[0].name, fileId: mockFileId, etag: mockEtagFromS3, key: mockKey }],
      };

      expect(confirmUploadRequest.request.method).toBe('PUT');
      expect(confirmUploadRequest.request.body).toEqual(expectedconfirmUploadReqBody);
    });

    describe('multiple files upload', () => {
      const mockUploadFilenames = ['certificate1.pdf', 'certificate2.pdf', 'certificate3.pdf'];
      const mockUploadFiles = mockUploadFilenames.map((filename) => new File([''], filename));
      const mockFileIds = ['fileId1', 'fileId2', 'fileId3'];
      const mockEtags = ['etag1', 'etag2', 'etag3'];
      const mockSignedUrls = mockFileIds.map((fileId) => `${mockSignedUrl}/${fileId}`);
      const mockKeys = mockFileIds.map((fileId) => `${fileId}/mockKey`);

      const mockSignedUrlResponse = {
        files: mockUploadFilenames.map((filename, index) => ({
          filename,
          signedUrl: mockSignedUrls[index],
          fileId: mockFileIds[index],
          key: mockKeys[index],
        })),
      };

      const expectedSignedUrlReqBody = {
        files: [
          { filename: mockUploadFiles[0].name },
          { filename: mockUploadFiles[1].name },
          { filename: mockUploadFiles[2].name },
        ],
      };
      const expectedConfirmUploadReqBody = {
        files: [
          { filename: mockUploadFiles[0].name, fileId: mockFileIds[0], etag: mockEtags[0], key: mockKeys[0] },
          { filename: mockUploadFiles[1].name, fileId: mockFileIds[1], etag: mockEtags[1], key: mockKeys[1] },
          { filename: mockUploadFiles[2].name, fileId: mockFileIds[2], etag: mockEtags[2], key: mockKeys[2] },
        ],
      };

      it('should be able to upload multiple files at the same time', () => {
        service.addCertificateToTraining(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockUploadFiles).subscribe();

        const signedUrlRequest = http.expectOne({ method: 'POST', url: certificateEndpoint });
        expect(signedUrlRequest.request.body).toEqual(expectedSignedUrlReqBody);

        signedUrlRequest.flush(mockSignedUrlResponse);

        mockSignedUrls.forEach((signedUrl, index) => {
          const uploadToS3Request = http.expectOne(signedUrl);
          expect(uploadToS3Request.request.method).toBe('PUT');
          expect(uploadToS3Request.request.body).toEqual(mockUploadFiles[index]);

          uploadToS3Request.flush(null, { headers: { etag: mockEtags[index] } });
        });

        const confirmUploadRequest = http.expectOne({ method: 'PUT', url: certificateEndpoint });
        expect(confirmUploadRequest.request.body).toEqual(expectedConfirmUploadReqBody);
      });
    });
  });

  describe('downloadCertificate', () => {
    const mockWorkplaceUid = 'mockWorkplaceUid';
    const mockWorkerUid = 'mockWorkerUid';
    const mockTrainingUid = 'mockTrainingUid';

    const mockFiles = ['mockCertificateUid123'];

    const certificateDownloadEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/training/${mockTrainingUid}/certificate/download`;

    it('should make call to expected backend endpoint', async () => {
      service.downloadCertificate(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockFiles).subscribe();

      const downloadRequest = http.expectOne(certificateDownloadEndpoint);
      expect(downloadRequest.request.method).toBe('POST');
    });

    it('should have request body that contains file uid', async () => {
      service.downloadCertificate(mockWorkplaceUid, mockWorkerUid, mockTrainingUid, mockFiles).subscribe();

      const downloadRequest = http.expectOne(certificateDownloadEndpoint);
      const expectedRequestBody = { filesToDownload: mockFiles };

      expect(downloadRequest.request.body).toEqual(expectedRequestBody);
    });
  });
});
