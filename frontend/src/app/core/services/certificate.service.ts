import { capitalize } from 'lodash';
import { forkJoin, from, merge, Observable } from 'rxjs';
import { concatMap, filter, map, mergeAll, mergeMap, tap, toArray } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Qualification, QualificationCertificate, QualificationsResponse } from '@core/model/qualification.model';
import { TrainingCertificate, TrainingRecord, TrainingResponse } from '@core/model/training.model';
import {
  ConfirmUploadRequest,
  DownloadCertificateSignedUrlResponse,
  FileInfoWithETag,
  S3UploadResponse,
  UploadCertificateSignedUrlRequest,
  UploadCertificateSignedUrlResponse,
} from '@core/model/trainingAndQualifications.model';
import { Certificate, CertificateDownload } from '@core/model/trainingAndQualifications.model';
import { FileUtil, NamedFileBlob } from '@core/utils/file-util';

@Injectable({
  providedIn: 'root',
})
export class BaseCertificateService {
  constructor(protected http: HttpClient) {
    if (this.constructor == BaseCertificateService) {
      throw new Error("Abstract base class can't be instantiated.");
    }
  }

  recordType: string;

  protected recordsEndpoint(workplaceUid: string, workerUid: string): string {
    throw new Error('Not implemented for base class');
  }

  protected certificateEndpoint(workplaceUid: string, workerUid: string, recordUid: string): string {
    throw new Error('Not implemented for base class');
  }

  protected getAllRecords(workplaceUid: string, workerUid: string): Observable<Qualification[] | TrainingRecord[]> {
    throw new Error('Not implemented for base class');
  }

  protected certificatesInRecord(record: Qualification | TrainingRecord): Certificate[] {
    throw new Error('Not implemented for base class');
  }

  public addCertificates(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToUpload: File[],
  ): Observable<any> {
    const listOfFilenames = filesToUpload.map((file) => ({ filename: file.name }));
    const requestBody: UploadCertificateSignedUrlRequest = { files: listOfFilenames };
    const endpoint = this.certificateEndpoint(workplaceUid, workerUid, recordUid);

    return this.http.post<UploadCertificateSignedUrlResponse>(endpoint, requestBody).pipe(
      mergeMap((response) => this.uploadAllCertificatestoS3(response, filesToUpload)),
      map((allFileInfoWithETag) => this.buildConfirmUploadRequestBody(allFileInfoWithETag)),
      mergeMap((confirmUploadRequestBody) =>
        this.confirmCertificateUpload(workplaceUid, workerUid, recordUid, confirmUploadRequestBody),
      ),
    );
  }

  protected uploadAllCertificatestoS3(
    signedUrlResponse: UploadCertificateSignedUrlResponse,
    filesToUpload: File[],
  ): Observable<FileInfoWithETag[]> {
    const allUploadResults$ = signedUrlResponse.files.map(({ signedUrl, fileId, filename, key }, index) => {
      const fileToUpload = filesToUpload[index];
      if (!fileToUpload.name || fileToUpload.name !== filename) {
        throw new Error('Invalid response from backend');
      }
      return this.uploadOneCertificateToS3(signedUrl, fileId, fileToUpload, key);
    });

    return forkJoin(allUploadResults$);
  }

  protected uploadOneCertificateToS3(
    signedUrl: string,
    fileId: string,
    uploadFile: File,
    key: string,
  ): Observable<FileInfoWithETag> {
    return this.http.put<S3UploadResponse>(signedUrl, uploadFile, { observe: 'response' }).pipe(
      map((s3response) => ({
        etag: s3response?.headers?.get('etag'),
        fileId,
        filename: uploadFile.name,
        key,
      })),
    );
  }

  protected buildConfirmUploadRequestBody(allFileInfoWithETag: FileInfoWithETag[]): ConfirmUploadRequest {
    return { files: allFileInfoWithETag };
  }

  protected confirmCertificateUpload(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    confirmUploadRequestBody: ConfirmUploadRequest,
  ) {
    const endpoint = this.certificateEndpoint(workplaceUid, workerUid, recordUid);
    return this.http.put<any>(endpoint, confirmUploadRequestBody);
  }

  public downloadCertificates(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDownload: CertificateDownload[],
  ): Observable<any> {
    return this.getCertificateDownloadUrls(workplaceUid, workerUid, recordUid, filesToDownload).pipe(
      mergeMap((res) => this.triggerCertificateDownloads(res['files'])),
    );
  }

  public getCertificateDownloadUrls(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDownload: CertificateDownload[],
  ): Observable<DownloadCertificateSignedUrlResponse> {
    const certificateEndpoint = this.certificateEndpoint(workplaceUid, workerUid, recordUid);
    return this.http.post<DownloadCertificateSignedUrlResponse>(`${certificateEndpoint}/download`, {
      files: filesToDownload,
    });
  }

  public triggerCertificateDownloads(files: { signedUrl: string; filename: string }[]): Observable<NamedFileBlob> {
    const blobsAndFilenames = this.downloadBlobsFromBucket(files);

    return from(blobsAndFilenames).pipe(
      mergeAll(),
      tap(({ fileBlob, filename }) => FileUtil.triggerSingleFileDownload(fileBlob, filename)),
    );
  }

  public downloadBlobsFromBucket(files: { signedUrl: string; filename: string }[]): Observable<NamedFileBlob>[] {
    const downloadedBlobs = files.map((file) => this.http.get(file.signedUrl, { responseType: 'blob' }));
    const blobsAndFilenames = downloadedBlobs.map((fileBlob$, index) =>
      fileBlob$.pipe(map((fileBlob) => ({ fileBlob, filename: files[index].filename }))),
    );

    return blobsAndFilenames;
  }

  public downloadAllCertificatesAsBlobs(workplaceUid: string, workerUid: string): Observable<NamedFileBlob> {
    return this.getAllRecords(workplaceUid, workerUid).pipe(
      mergeAll(),
      filter((record) => this.certificatesInRecord(record).length > 0),
      concatMap((record) =>
        this.downloadCertificatesForOneRecordAsBlobs(
          workplaceUid,
          workerUid,
          record.uid,
          this.certificatesInRecord(record),
        ),
      ),
      map((file) => this.addFolderName(file)),
    );
  }

  public downloadCertificatesForOneRecordAsBlobs(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDownload: CertificateDownload[],
  ): Observable<NamedFileBlob> {
    return this.getCertificateDownloadUrls(workplaceUid, workerUid, recordUid, filesToDownload).pipe(
      mergeMap((res) => this.downloadBlobsFromBucket(res['files'])),
      mergeAll(),
    );
  }

  protected addFolderName(file: NamedFileBlob): NamedFileBlob {
    const { filename, fileBlob } = file;
    return { filename: `${capitalize(this.recordType)} certificates/${filename}`, fileBlob };
  }

  public deleteCertificates(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDelete: Certificate[],
  ): Observable<any> {
    const certificateEndpoint = this.certificateEndpoint(workplaceUid, workerUid, recordUid);
    return this.http.post<any>(`${certificateEndpoint}/delete`, { files: filesToDelete });
  }
}

@Injectable()
export class TrainingCertificateService extends BaseCertificateService {
  recordType = 'training';

  protected recordsEndpoint(workplaceUid: string, workerUid: string): string {
    return `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/training`;
  }

  protected certificateEndpoint(workplaceUid: string, workerUid: string, trainingUid: string): string {
    const recordsEndpoint = this.recordsEndpoint(workplaceUid, workerUid);
    return `${recordsEndpoint}/${trainingUid}/certificate`;
  }

  protected getAllRecords(workplaceUid: string, workerUid: string): Observable<TrainingRecord[]> {
    const recordsEndpoint = this.recordsEndpoint(workplaceUid, workerUid);
    return this.http.get(recordsEndpoint).pipe(map((response: TrainingResponse) => response.training));
  }

  protected certificatesInRecord(record: TrainingRecord): TrainingCertificate[] {
    return record?.trainingCertificates ?? [];
  }
}

@Injectable()
export class QualificationCertificateService extends BaseCertificateService {
  recordType = 'qualification';

  protected recordsEndpoint(workplaceUid: string, workerUid: string): string {
    return `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/qualification`;
  }

  protected certificateEndpoint(workplaceUid: string, workerUid: string, qualificationUid: string): string {
    const recordsEndpoint = this.recordsEndpoint(workplaceUid, workerUid);
    return `${recordsEndpoint}/${qualificationUid}/certificate`;
  }

  protected getAllRecords(workplaceUid: string, workerUid: string): Observable<Qualification[]> {
    const recordsEndpoint = this.recordsEndpoint(workplaceUid, workerUid);
    return this.http.get(recordsEndpoint).pipe(map((response: QualificationsResponse) => response.qualifications));
  }

  protected certificatesInRecord(record: Qualification): QualificationCertificate[] {
    return record?.qualificationCertificates ?? [];
  }
}

@Injectable()
export class DownloadCertificateService {
  constructor(
    private trainingCertificateService: TrainingCertificateService,
    private qualificationCertificateService: QualificationCertificateService,
  ) {}

  public downloadAllCertificatesForWorker(
    workplaceUid: string,
    workerUid: string,
    zipFileName: string = 'All certificates.zip',
  ): Promise<void> {
    const allTrainingCerts$ = this.trainingCertificateService.downloadAllCertificatesAsBlobs(workplaceUid, workerUid);
    const allQualificationCerts$ = this.qualificationCertificateService.downloadAllCertificatesAsBlobs(
      workplaceUid,
      workerUid,
    );

    const downloadAllCertificatesAsZip$ = merge(allTrainingCerts$, allQualificationCerts$).pipe(
      toArray(),
      mergeMap((allFileBlobs) => from(FileUtil.saveFilesAsZip(allFileBlobs, zipFileName))),
    );

    return downloadAllCertificatesAsZip$.toPromise();
  }
}
