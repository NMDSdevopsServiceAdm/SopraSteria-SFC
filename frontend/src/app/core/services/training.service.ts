import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import {
  allMandatoryTrainingCategories,
  CertificateDownload,
  CertificateSignedUrlRequest,
  CertificateSignedUrlResponse,
  ConfirmUploadRequest,
  FileInfoWithETag,
  S3UploadResponse,
  SelectedTraining,
  TrainingCategory,
} from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  protected _selectedTraining = null;
  public selectedStaff: Worker[] = [];
  public addMultipleTrainingInProgress$ = new BehaviorSubject<boolean>(false);
  private _trainingOrQualificationPreviouslySelected: string = null;
  public updatingSelectedStaffForMultipleTraining: boolean = null;

  constructor(private http: HttpClient) {}

  getAllTrainingByStatus(workplaceUid: string, status: string, queryParams?: Params): Observable<any> {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/trainingAndQualifications/${status}`,
      {
        params: queryParams,
      },
    );
  }

  getMissingMandatoryTraining(workplaceUid: string, queryParams?: Params): Observable<any> {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/trainingAndQualifications/missing-training`,
      {
        params: queryParams,
      },
    );
  }

  public deleteCategoryById(establishmentId, categoryId) {
    return this.http.delete(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/mandatoryTraining/${categoryId}`,
    );
  }

  public updateSelectedStaff(formValue): void {
    this.selectedStaff = formValue;
  }

  public resetSelectedStaff(): void {
    this.selectedStaff = [];
  }

  public get selectedTraining(): SelectedTraining {
    return this._selectedTraining;
  }

  public set selectedTraining(selectedTraining: SelectedTraining) {
    if (selectedTraining) {
      this._selectedTraining = selectedTraining;
    }
  }

  public resetSelectedTraining(): void {
    this._selectedTraining = null;
  }

  //get all mandatory training
  public getAllMandatoryTrainings(establishmentId): Observable<allMandatoryTrainingCategories> {
    return this.http.get<allMandatoryTrainingCategories>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/mandatoryTraining`,
    );
  }

  public deleteAllMandatoryTraining(establishmentId: number) {
    return this.http.delete(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/mandatoryTraining`);
  }

  public get trainingOrQualificationPreviouslySelected(): string {
    if (!this._trainingOrQualificationPreviouslySelected) {
      this._trainingOrQualificationPreviouslySelected = localStorage.getItem(
        'trainingOrQualificationPreviouslySelected',
      );
    }

    return this._trainingOrQualificationPreviouslySelected;
  }

  public set trainingOrQualificationPreviouslySelected(value: string) {
    this._trainingOrQualificationPreviouslySelected = value;
    localStorage.setItem('trainingOrQualificationPreviouslySelected', value);
  }

  public resetState(): void {
    this.addMultipleTrainingInProgress$.next(false);
    this.resetSelectedStaff();
    this.resetSelectedTraining();
    this.clearSelectedTrainingCategory();
  }

  public setSelectedTrainingCategory(trainingCategory: TrainingCategory) {
    if (trainingCategory) {
      if (this._selectedTraining) {
        this._selectedTraining.trainingCategory = trainingCategory;
      } else {
        this._selectedTraining = { trainingCategory };
      }
    }
  }

  public clearSelectedTrainingCategory(): void {
    if (this?._selectedTraining?.trainingCategory) {
      this._selectedTraining.trainingCategory = null;
    }
  }

  public setUpdatingSelectedStaffForMultipleTraining(value: boolean): void {
    this.updatingSelectedStaffForMultipleTraining = value;
  }

  public getUpdatingSelectedStaffForMultipleTraining(): boolean {
    return this.updatingSelectedStaffForMultipleTraining;
  }

  public clearUpdatingSelectedStaffForMultipleTraining(): void {
    this.updatingSelectedStaffForMultipleTraining = null;
  }

  public addCertificateToTraining(workplaceUid: string, workerUid: string, trainingUid: string, filesToUpload: File[]) {
    const listOfFilenames = filesToUpload.map((file) => ({ filename: file.name }));
    const requestBody: CertificateSignedUrlRequest = { files: listOfFilenames };

    return this.http
      .post<CertificateSignedUrlResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/training/${trainingUid}/certificate`,
        requestBody,
      )
      .pipe(
        mergeMap((response) => this.uploadAllCertificatestoS3(response, filesToUpload)),
        map((allFileInfoWithETag) => this.buildConfirmUploadRequestBody(allFileInfoWithETag)),
        mergeMap((confirmUploadRequestBody) =>
          this.confirmCertificateUpload(workplaceUid, workerUid, trainingUid, confirmUploadRequestBody),
        ),
      );
  }

  private uploadAllCertificatestoS3(
    signedUrlResponse: CertificateSignedUrlResponse,
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

  private uploadOneCertificateToS3(
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

  public downloadCertificates(
    workplaceUid: string,
    workerUid: string,
    trainingUid: string,
    filesToDownload: CertificateDownload[],
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/training/${trainingUid}/certificate/download`,
      { filesToDownload },
    );
  }

  public triggerCertificateDownloads(files: { signedUrl: string; filename: string }[]): void {
    const downloadRequests = files.map((file) => this.http.get(file.signedUrl, { responseType: 'blob' }));

    forkJoin(downloadRequests).subscribe(
      (fileBlobs: Blob[]) => {
        fileBlobs.forEach((blob, index) => {
          this.triggerSingleCertificateDownload(blob, files[index].filename);
        });
      },
      (error) => {
        console.log('======================= error ======================');
        console.log(error);
        throw error;
      },
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

  private buildConfirmUploadRequestBody(allFileInfoWithETag: FileInfoWithETag[]): ConfirmUploadRequest {
    return { files: allFileInfoWithETag };
  }

  private confirmCertificateUpload(
    workplaceUid: string,
    workerUid: string,
    trainingUid: string,
    confirmUploadRequestBody: ConfirmUploadRequest,
  ) {
    return this.http.put<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/training/${trainingUid}/certificate`,
      confirmUploadRequestBody,
    );
  }
}
