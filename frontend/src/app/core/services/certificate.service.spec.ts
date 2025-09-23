import { toArray } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  mockQualificationRecordsResponse,
  mockTrainingRecordsResponse,
  qualificationUidsWithCerts,
  qualificationUidsWithoutCerts as qualificationUidsNoCerts,
  trainingUidsWithCerts,
  trainingUidsWithoutCerts as trainingUidsNoCerts,
  MockTrainingCertificateService,
  MockQualificationCertificateService,
  mockTrainingCertificates,
  mockQualificationCertificates,
} from '@core/test-utils/MockCertificateService';

import {
  DownloadCertificateService,
  QualificationCertificateService,
  TrainingCertificateService,
} from './certificate.service';
import { mockCertificateFileBlob } from '../test-utils/MockCertificateService';
import { FileUtil } from '@core/utils/file-util';

describe('CertificateService', () => {
  const testConfigs = [
    {
      certificateType: 'training',
      serviceClass: TrainingCertificateService,
    },
    {
      certificateType: 'qualification',
      serviceClass: QualificationCertificateService,
    },
  ];
  testConfigs.forEach(({ certificateType, serviceClass }) => {
    describe(`for Certificate type: ${certificateType}`, () => {
      let service: TrainingCertificateService | QualificationCertificateService;
      let http: HttpTestingController;

      beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [HttpClientTestingModule],
          providers: [serviceClass],
        });
        if (certificateType === 'training') {
          service = TestBed.inject(TrainingCertificateService);
        } else {
          service = TestBed.inject(QualificationCertificateService);
        }

        http = TestBed.inject(HttpTestingController);
      });

      afterEach(() => {
        TestBed.inject(HttpTestingController).verify();
      });

      describe('addCertificates', () => {
        const mockWorkplaceUid = 'mockWorkplaceUid';
        const mockWorkerUid = 'mockWorkerUid';
        const mockRecordUid = 'mockRecordUid';

        const mockUploadFiles = [new File([''], 'certificate.pdf')];
        const mockFileId = 'mockFileId';
        const mockEtagFromS3 = 'mock-etag';
        const mockSignedUrl = 'http://localhost/mock-signed-url-for-upload';

        const certificateEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/${certificateType}/${mockRecordUid}/certificate`;

        it('should call to backend to retreive a signed url to upload certificate', async () => {
          service.addCertificates(mockWorkplaceUid, mockWorkerUid, mockRecordUid, mockUploadFiles).subscribe();

          const signedUrlRequest = http.expectOne(certificateEndpoint);
          expect(signedUrlRequest.request.method).toBe('POST');
        });

        it('should have request body that contains filename', async () => {
          service.addCertificates(mockWorkplaceUid, mockWorkerUid, mockRecordUid, mockUploadFiles).subscribe();

          const signedUrlRequest = http.expectOne(certificateEndpoint);

          const expectedRequestBody = { files: [{ filename: 'certificate.pdf' }] };

          expect(signedUrlRequest.request.body).toEqual(expectedRequestBody);
        });

        it('should upload the file with the signed url received from backend', async () => {
          service.addCertificates(mockWorkplaceUid, mockWorkerUid, mockRecordUid, mockUploadFiles).subscribe();

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
          service.addCertificates(mockWorkplaceUid, mockWorkerUid, mockRecordUid, mockUploadFiles).subscribe();

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
            service.addCertificates(mockWorkplaceUid, mockWorkerUid, mockRecordUid, mockUploadFiles).subscribe();

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

      describe('downloadCertificates', () => {
        const mockWorkplaceUid = 'mockWorkplaceUid';
        const mockWorkerUid = 'mockWorkerUid';
        const mockRecordUid = 'mockRecordUid';

        const mockFiles = [{ uid: 'mockCertificateUid123', filename: 'mockCertificateName' }];

        const certificateDownloadEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/${certificateType}/${mockRecordUid}/certificate/download`;

        it('should make call to expected backend endpoint', async () => {
          service.downloadCertificates(mockWorkplaceUid, mockWorkerUid, mockRecordUid, mockFiles).subscribe();

          const downloadRequest = http.expectOne(certificateDownloadEndpoint);
          expect(downloadRequest.request.method).toBe('POST');
        });

        it('should have request body that contains file uid', async () => {
          service.downloadCertificates(mockWorkplaceUid, mockWorkerUid, mockRecordUid, mockFiles).subscribe();

          const downloadRequest = http.expectOne(certificateDownloadEndpoint);
          const expectedRequestBody = { files: mockFiles };

          expect(downloadRequest.request.body).toEqual(expectedRequestBody);
        });
      });

      describe('triggerCertificateDownloads', () => {
        it('should download certificates by creating and triggering anchor tag, then cleaning DOM', () => {
          const mockCertificates = [{ signedUrl: 'https://example.com/file1.pdf', filename: 'file1.pdf' }];
          const mockBlob = new Blob(['file content'], { type: 'application/pdf' });
          const mockBlobUrl = 'blob:http://signed-url-example.com/blob-url';

          const createElementSpy = spyOn(document, 'createElement').and.callThrough();
          const appendChildSpy = spyOn(document.body, 'appendChild').and.callThrough();
          const removeChildSpy = spyOn(document.body, 'removeChild').and.callThrough();
          const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL').and.callThrough();
          spyOn(window.URL, 'createObjectURL').and.returnValue(mockBlobUrl);

          service.triggerCertificateDownloads(mockCertificates).subscribe();

          const downloadReq = http.expectOne(mockCertificates[0].signedUrl);
          downloadReq.flush(mockBlob);

          // Assert anchor element appended
          expect(createElementSpy).toHaveBeenCalledWith('a');
          expect(appendChildSpy).toHaveBeenCalled();

          // Assert anchor element has correct attributes
          const createdAnchor = createElementSpy.calls.mostRecent().returnValue as HTMLAnchorElement;
          expect(createdAnchor.href).toBe(mockBlobUrl);
          expect(createdAnchor.download).toBe(mockCertificates[0].filename);

          // Assert DOM is cleaned up after download
          expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockBlobUrl);
          expect(removeChildSpy).toHaveBeenCalled();
        });
      });

      describe('downloadAllCertificatesAsBlobs', () => {
        const mockWorkplaceUid = 'mockWorkplaceUid';
        const mockWorkerUid = 'mockWorkerUid';

        const recordsEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/${certificateType}`;

        const mockRecordsResponse =
          certificateType === 'training' ? mockTrainingRecordsResponse : mockQualificationRecordsResponse;
        const recordsHavingCertificates =
          certificateType === 'training' ? trainingUidsWithCerts : qualificationUidsWithCerts;
        const recordsWithoutCertificates =
          certificateType === 'training' ? trainingUidsNoCerts : qualificationUidsNoCerts;

        it('should query the backend to get all training / qualification records for the worker', async () => {
          service.downloadAllCertificatesAsBlobs(mockWorkplaceUid, mockWorkerUid).subscribe();

          http.expectOne(recordsEndpoint);
        });

        it('should request backend for signedUrls and download every certificates as blobs', async () => {
          service.downloadAllCertificatesAsBlobs(mockWorkplaceUid, mockWorkerUid).subscribe();

          http.expectOne(recordsEndpoint).flush(mockRecordsResponse);

          recordsHavingCertificates.forEach((recordUid) => {
            const certificateDownloadEndpoint = `${recordsEndpoint}/${recordUid}/certificate/download`;
            const mockresponse = {
              files: [
                { signedUrl: `https://mocks3endpoint/${recordUid}-1.pdf`, filename: `${recordUid}-1.pdf` },
                { signedUrl: `https://mocks3endpoint/${recordUid}-2.pdf`, filename: `${recordUid}-2.pdf` },
              ],
            };
            http.expectOne({ url: certificateDownloadEndpoint, method: 'POST' }).flush(mockresponse);

            http.expectOne(`https://mocks3endpoint/${recordUid}-1.pdf`).flush(mockCertificateFileBlob);
            http.expectOne(`https://mocks3endpoint/${recordUid}-2.pdf`).flush(mockCertificateFileBlob);
          });

          // should not call certificate download endpoint for records that have no certificates
          recordsWithoutCertificates.forEach((recordUid) => {
            const certificateDownloadEndpoint = `${recordsEndpoint}/${recordUid}/certificate/download`;
            http.expectNone(certificateDownloadEndpoint);
          });
        });

        it('should return an observable for every certificates as file blobs', async () => {
          const returnedObservable = service.downloadAllCertificatesAsBlobs(mockWorkplaceUid, mockWorkerUid);
          const promise = returnedObservable.pipe(toArray()).toPromise();

          http.expectOne(recordsEndpoint).flush(mockRecordsResponse);

          recordsHavingCertificates.forEach((recordUid) => {
            const certificateDownloadEndpoint = `${recordsEndpoint}/${recordUid}/certificate/download`;
            const mockResponse = {
              files: [
                { signedUrl: `https://mocks3endpoint/${recordUid}-1.pdf`, filename: `${recordUid}-1.pdf` },
                { signedUrl: `https://mocks3endpoint/${recordUid}-2.pdf`, filename: `${recordUid}-2.pdf` },
              ],
            };
            http.expectOne({ url: certificateDownloadEndpoint, method: 'POST' }).flush(mockResponse);

            http.expectOne(`https://mocks3endpoint/${recordUid}-1.pdf`).flush(mockCertificateFileBlob);
            http.expectOne(`https://mocks3endpoint/${recordUid}-2.pdf`).flush(mockCertificateFileBlob);
          });

          const allFileBlobs = await promise;
          expect(allFileBlobs.length).toEqual(4);

          const expectedFolderName =
            certificateType === 'training' ? 'Training certificates' : 'Qualification certificates';

          for (const recordUid of recordsHavingCertificates) {
            expect(allFileBlobs).toContain({
              filename: `${expectedFolderName}/${recordUid}-1.pdf`,
              fileBlob: mockCertificateFileBlob,
            });
            expect(allFileBlobs).toContain({
              filename: `${expectedFolderName}/${recordUid}-2.pdf`,
              fileBlob: mockCertificateFileBlob,
            });
          }
        });
      });

      describe('deleteCertificates', () => {
        it('should call the endpoint for deleting training certificates', async () => {
          const mockWorkplaceUid = 'mockWorkplaceUid';
          const mockWorkerUid = 'mockWorkerUid';
          const mockRecordUid = 'mockRecordUid';
          const mockFilesToDelete = [
            {
              uid: 'uid-1',
              filename: 'first_aid_v1.pdf',
              uploadDate: '2024-09-23T11:02:10.000Z',
            },
          ];

          const deleteCertificatesEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/worker/${mockWorkerUid}/${certificateType}/${mockRecordUid}/certificate/delete`;

          service.deleteCertificates(mockWorkplaceUid, mockWorkerUid, mockRecordUid, mockFilesToDelete).subscribe();

          const deleteRequest = http.expectOne(deleteCertificatesEndpoint);
          const expectedRequestBody = { files: mockFilesToDelete };

          expect(deleteRequest.request.method).toBe('POST');
          expect(deleteRequest.request.body).toEqual(expectedRequestBody);
        });
      });
    });
  });
});

describe('DownloadCertificateService', () => {
  let service: DownloadCertificateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DownloadCertificateService,
        { provide: TrainingCertificateService, useClass: MockTrainingCertificateService },
        { provide: QualificationCertificateService, useClass: MockQualificationCertificateService },
      ],
    });
    service = TestBed.inject(DownloadCertificateService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('downloadAllCertificatesForWorker', () => {
    it('should download all certificates for a worker and save as a zip file', async () => {
      const fileUtilSpy = spyOn(FileUtil, 'saveFilesAsZip').and.callThrough();

      await service.downloadAllCertificatesForWorker('mock-workplace-uid', 'mock-worker-uid', 'mock-filename.zip');

      expect(fileUtilSpy).toHaveBeenCalled();
      const contentsOfZipFile = fileUtilSpy.calls.mostRecent().args[0];
      const nameOfZipFile = fileUtilSpy.calls.mostRecent().args[1];

      expect(nameOfZipFile).toEqual('mock-filename.zip');

      mockTrainingCertificates.forEach((certificate) => {
        expect(contentsOfZipFile).toContain(
          jasmine.objectContaining({
            filename: 'Training certificates/' + certificate.filename,
            fileBlob: mockCertificateFileBlob,
          }),
        );
      });
      mockQualificationCertificates.forEach((certificate) => {
        expect(contentsOfZipFile).toContain(
          jasmine.objectContaining({
            filename: 'Qualification certificates/' + certificate.filename,
            fileBlob: mockCertificateFileBlob,
          }),
        );
      });
    });
  });
});
