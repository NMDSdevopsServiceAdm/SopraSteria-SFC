import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';

import { BulkUploadService } from './bulk-upload.service';

describe('BulkUploadService', () => {
  let service: BulkUploadService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BulkUploadService],
    });
    service = TestBed.inject(BulkUploadService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('getLockStatus', () => {
    it('should get the bulk upload lock status of an establishment', () => {
      service.getLockStatus('establishmentId').subscribe();

      const req = http.expectOne('/api/establishment/establishmentId/bulkupload/lockstatus');
      expect(req.request.method).toBe('GET');
    });
  });

  describe('unlockBulkUpload', () => {
    it('should unlock bulk upload for an establishment', () => {
      service.unlockBulkUpload('establishmentId').subscribe();

      const req = http.expectOne('/api/establishment/establishmentId/bulkupload/unlock');
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getDataCSV', () => {
    it('should call getDataCSV with the correct url when passed a bulk upload file type of Establishment', () => {
      service.getDataCSV('establishmentId', BulkUploadFileType.Establishment).subscribe();

      const req = http.expectOne('/api/establishment/establishmentId/bulkupload/download/establishments');
      expect(req.request.method).toBe('GET');
    });

    it('should call getDataCSV with the correct url when passed a bulk upload file type of Worker', () => {
      service.getDataCSV('establishmentId', BulkUploadFileType.Worker).subscribe();

      const req = http.expectOne('/api/establishment/establishmentId/bulkupload/download/workers');
      expect(req.request.method).toBe('GET');
    });

    it('should call getDataCSV with the correct url when passed a bulk upload file type of WorkerSanitise', () => {
      service.getDataCSV('establishmentId', BulkUploadFileType.WorkerSanitise).subscribe();

      const req = http.expectOne('/api/establishment/establishmentId/bulkupload/download/workersSanitise');
      expect(req.request.method).toBe('GET');
    });

    it('should call getDataCSV with the correct url when passed a bulk upload file type of Training', () => {
      service.getDataCSV('establishmentId', BulkUploadFileType.Training).subscribe();

      const req = http.expectOne('/api/establishment/establishmentId/bulkupload/download/training');
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getUploadedFileFromS3', () => {
    it('should call getUploadedFileFromS3 with the correct url when passed a bulk upload file type of Establishment', () => {
      service
        .getUploadedFileFromS3('establishmentId', 'establishmentID/establishment.csv', BulkUploadFileType.Establishment)
        .subscribe();

      const req = http.expectOne(
        '/api/establishment/establishmentId/bulkupload/uploaded/establishmentID/establishment.csv?downloadType=Workplace',
      );
      expect(req.request.method).toBe('GET');
    });

    it('should call getUploadedFileFromS3 with the correct url when passed a bulk upload file type of Training', () => {
      service
        .getUploadedFileFromS3('establishmentId', 'establishmentID/training.csv', BulkUploadFileType.Training)
        .subscribe();

      const req = http.expectOne(
        '/api/establishment/establishmentId/bulkupload/uploaded/establishmentID/training.csv?downloadType=Training',
      );
      expect(req.request.method).toBe('GET');
    });

    it('should call getUploadedFileFromS3 with the correct url when passed a bulk upload file type of Worker', () => {
      service
        .getUploadedFileFromS3('establishmentId', 'establishmentID/staff.csv', BulkUploadFileType.Worker)
        .subscribe();

      const req = http.expectOne(
        '/api/establishment/establishmentId/bulkupload/uploaded/establishmentID/staff.csv?downloadType=Staff',
      );
      expect(req.request.method).toBe('GET');
    });

    it('should call getUploadedFileFromS3 with the correct url when passed a bulk upload file type of WorkerSanitise', () => {
      service
        .getUploadedFileFromS3('establishmentId', 'establishmentID/staff.csv', BulkUploadFileType.WorkerSanitise)
        .subscribe();

      const req = http.expectOne(
        '/api/establishment/establishmentId/bulkupload/uploaded/establishmentID/staff.csv?downloadType=StaffSanitise',
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
