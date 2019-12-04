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
      const mockPresignedUrls = [
        {
          filename: 'workers.csv',
          signedUrl:
            'https://sfcbulkuploadfiles.s3.eu-west-2.amazonaws.com/479/latest/workers.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVJZVYRR3Y57EFIOC%2F20191125%2Feu-west-2%2Fs3%2Faws4_request&X-Amz-Date=20191125T154950Z&X-Amz-Expires=300&X-Amz-Signature=405cbbe79b512afee1010a939ada7034b0b04642ae3fbffbb6e292e93768811b&X-Amz-SignedHeaders=host%3Bx-amz-meta-establishmentid%3Bx-amz-meta-username%3Bx-amz-meta-validationstatus&x-amz-meta-establishmentid=479&x-amz-meta-username=aylingw&x-amz-meta-validationstatus=pending',
        },
        {
          filename: 'establishments.csv',
          signedUrl:
            'https://sfcbulkuploadfiles.s3.eu-west-2.amazonaws.com/479/latest/establishments.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVJZVYRR3Y57EFIOC%2F20191125%2Feu-west-2%2Fs3%2Faws4_request&X-Amz-Date=20191125T154950Z&X-Amz-Expires=300&X-Amz-Signature=98880e9cba7b28eb9c090dfc42475eb06b097952450e34f6980d78cfb1e723ac&X-Amz-SignedHeaders=host%3Bx-amz-meta-establishmentid%3Bx-amz-meta-username%3Bx-amz-meta-validationstatus&x-amz-meta-establishmentid=479&x-amz-meta-username=aylingw&x-amz-meta-validationstatus=pending',
        },
      ];
      const mockLock = {
        message: 'Lock for establishment 479 acquired.',
        requestId: 'ec67d8f8-5d05-40bb-952d-ed7f7e5fdbf0',
      };

      service.getPresignedUrls(mockPresignedFiles).subscribe(presignedUrls => {
        expect(presignedUrls).toEqual(mockPresignedUrls);
      });

      const lockReq = httpTestingController.expectOne(
        `/api/establishment/${this.establishmentService.establishmentId}/bulkupload/uploaded`
      );
      const presignedUrlReq = httpTestingController.expectOne(
        `/api/establishment/${this.establishmentService.establishmentId}/bulkupload/uploaded`
      );
      expect(lockReq.request.method).toEqual('POST');
      expect(presignedUrlReq.request.method).toEqual('GET');

      lockReq.flush(mockLock);
      presignedUrlReq.flush(mockPresignedUrls);
    });
  });
});
