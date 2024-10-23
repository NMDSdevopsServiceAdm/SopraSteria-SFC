import { forkJoin, from, Observable } from 'rxjs';
import { concatMap, filter, map, mergeAll, mergeMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ConfirmUploadRequest,
  DownloadCertificateSignedUrlResponse,
  FileInfoWithETag,
  S3UploadResponse,
  TrainingCertificate,
  TrainingRecord,
  TrainingResponse,
  UploadCertificateSignedUrlRequest,
  UploadCertificateSignedUrlResponse,
} from '@core/model/training.model';
import { Certificate, CertificateDownload } from '@core/model/trainingAndQualifications.model';
import { FileUtil, NamedFileBlob } from '@core/utils/file-util';
import { Qualification, QualificationCertificate, QualificationsResponse } from '@core/model/qualification.model';

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

  protected getCertificatesFromRecord(record: Qualification | TrainingRecord): Certificate[] {
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

  public downloadAllCertificatesAsBlobs(workplaceUid: string, workerUid: string): Observable<NamedFileBlob> {
    return this.getAllRecords(workplaceUid, workerUid).pipe(
      mergeAll(),
      filter((record) => this.getCertificatesFromRecord(record).length > 0),
      concatMap((record) =>
        this.downloadCertificatesAsBlobs(workplaceUid, workerUid, record.uid, this.getCertificatesFromRecord(record)),
      ),
      map((file) => this.addFolderName(file)),
    );
  }

  protected addFolderName(file: NamedFileBlob): NamedFileBlob {
    const { filename, fileBlob } = file;
    return { filename: `${this.recordType} certificates/${filename}`, fileBlob };
  }

  public downloadCertificatesAsBlobs(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDownload: CertificateDownload[],
  ): Observable<NamedFileBlob> {
    // TODO: Delete this before PR
    // uncomment this to test frontend without actually downloading from S3
    // return from(filesToDownload.map((file) => ({ fileBlob: new Blob(['abc']), filename: file.filename })));

    return this.getCertificateDownloadUrls(workplaceUid, workerUid, recordUid, filesToDownload).pipe(
      mergeMap((res) => this.downloadBlobsFromBucket(res['files'])),
      mergeAll(),
    );
  }

  public getCertificateDownloadUrls(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDownload: CertificateDownload[],
  ) {
    const certificateEndpoint = this.certificateEndpoint(workplaceUid, workerUid, recordUid);
    return this.http.post<DownloadCertificateSignedUrlResponse>(`${certificateEndpoint}/download`, {
      files: filesToDownload,
    });
  }

  public triggerCertificateDownloads(files: { signedUrl: string; filename: string }[]): Observable<any> {
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

  protected getCertificatesFromRecord(record: TrainingRecord): TrainingCertificate[] {
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

  protected getCertificatesFromRecord(record: Qualification): QualificationCertificate[] {
    return record?.qualificationCertificates ?? [];
  }
}
