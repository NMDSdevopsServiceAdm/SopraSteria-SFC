import { forkJoin, from, Observable } from 'rxjs';
import { map, mergeAll, mergeMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ConfirmUploadRequest,
  DownloadCertificateSignedUrlResponse,
  FileInfoWithETag,
  S3UploadResponse,
  UploadCertificateSignedUrlRequest,
  UploadCertificateSignedUrlResponse,
} from '@core/model/training.model';
import { Certificate, CertificateDownload } from '@core/model/trainingAndQualifications.model';

@Injectable({
  providedIn: 'root',
})
export class BaseCertificateService {
  constructor(protected http: HttpClient) {
    if (this.constructor == BaseCertificateService) {
      throw new Error("Abstract base class can't be instantiated.");
    }
  }

  protected certificateEndpoint(workplaceUid: string, workerUid: string, recordUid: string): string {
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
  ) {
    const certificateEndpoint = this.certificateEndpoint(workplaceUid, workerUid, recordUid);
    return this.http.post<DownloadCertificateSignedUrlResponse>(`${certificateEndpoint}/download`, { filesToDownload });
  }

  public triggerCertificateDownloads(files: { signedUrl: string; filename: string }[]): Observable<{
    blob: Blob;
    filename: string;
  }> {
    const downloadedBlobs = files.map((file) => this.http.get(file.signedUrl, { responseType: 'blob' }));
    const blobsAndFilenames = downloadedBlobs.map((blob$, index) =>
      blob$.pipe(map((blob) => ({ blob, filename: files[index].filename }))),
    );
    return from(blobsAndFilenames).pipe(
      mergeAll(),
      tap(({ blob, filename }) => this.triggerSingleCertificateDownload(blob, filename)),
    );
  }

  private triggerSingleCertificateDownload(fileBlob: Blob, filename: string): void {
    const blobUrl = window.URL.createObjectURL(fileBlob);
    const link = this.createHiddenDownloadLink(blobUrl, filename);

    // Append the link to the body and click to trigger download
    document.body.appendChild(link);
    link.click();

    // Remove the link
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }

  private createHiddenDownloadLink(blobUrl: string, filename: string): HTMLAnchorElement {
    const link = document.createElement('a');

    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    return link;
  }

  public deleteCertificates(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDelete: Certificate[],
  ): Observable<any> {
    const certificateEndpoint = this.certificateEndpoint(workplaceUid, workerUid, recordUid);
    return this.http.post<any>(`${certificateEndpoint}/delete`, { filesToDelete });
  }
}

@Injectable()
export class TrainingCertificateService extends BaseCertificateService {
  protected certificateEndpoint(workplaceUid: string, workerUid: string, trainingUid: string): string {
    return `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/training/${trainingUid}/certificate`;
  }
}

@Injectable()
export class QualificationCertificateService extends BaseCertificateService {
  protected certificateEndpoint(workplaceUid: string, workerUid: string, qualificationUid: string): string {
    return `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/qualification/${qualificationUid}/certificate`;
  }
}
