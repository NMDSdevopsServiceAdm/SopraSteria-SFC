import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FilesUploadComponent } from '../../features/bulk-upload/files-upload/files-upload.component';
import { BulkUploadService } from './bulk-upload.service';

describe('BulkUploadService', () => {
  // We declare the variables that we'll use for the Test Controller and for our Service
  let httpTestingController: HttpTestingController;
  let service: BulkUploadService;
  let controller: FilesUploadComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BulkUploadService],
      imports: [HttpClientTestingModule],
    });

    // We inject our service (which imports the HttpClient) and the Test Controller
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(BulkUploadService);
    controller = TestBed.get(FilesUploadComponent);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  // Angular default test added when you generate a service using the CLI
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('getPresignedUrls()', () => {
    it('returned Observable should match the right data', () => {
      const mockPresignedFiles = {
        files: [
          {
            filename: 'workers.csv',
          },
          {
            filename: 'establishments.csv',
          },
        ],
      };

      service.getPresignedUrls(mockPresignedFiles).subscribe(presignedUrls => {
        expect(presignedUrls).toEqual();
      });

      const req = httpTestingController.expectOne('http://localhost:8089/topics/1/courses');

      expect(req.request.method).toEqual('POST');

      req.flush(mockCourse);
    });
  });
});
