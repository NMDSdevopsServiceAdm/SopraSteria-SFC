import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import {
  allMandatoryTrainingCategories,
  TrainingCategory,
  TrainingCategoryResponse,
  SelectedTraining,
  S3UploadResponse,
  CertificateSignedUrlRequest,
  CertificateSignedUrlResponse,
  ConfirmUploadRequest,
} from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
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

  public addCertificateToTraining(workplaceUid: string, workerUid: string, trainingUid: string, uploadFile: File) {
    const requestBody: CertificateSignedUrlRequest = { files: [{ filename: uploadFile.name }] };

    return this.http
      .post<CertificateSignedUrlResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/training/${trainingUid}/certificate`,
        requestBody,
      )
      .pipe(
        mergeMap((response) => {
          const { signedUrl, fileId } = response?.files[0];
          return this.uploadCertificateToS3(signedUrl, fileId, uploadFile);
        }),
        mergeMap(({ s3response, fileId }) => {
          const etag = s3response.headers.get('Etag');
          const confirmUploadRequest: ConfirmUploadRequest = { files: [{ filename: uploadFile.name, etag, fileId }] };
          return this.confirmCertificateUpload(workplaceUid, workerUid, trainingUid, confirmUploadRequest);
        }),
      );
  }

  private uploadCertificateToS3(signedUrl: string, fileId: string, uploadFile: File) {
    return this.http.put<S3UploadResponse>(signedUrl, uploadFile, { observe: 'response' }).pipe(
      map((s3response) => ({
        s3response,
        fileId,
      })),
    );
  }

  private confirmCertificateUpload(
    workplaceUid: string,
    workerUid: string,
    trainingUid: string,
    confirmUploadRequest: ConfirmUploadRequest,
  ) {
    return this.http.put<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/training/${trainingUid}/certificate`,
      confirmUploadRequest,
    );
  }
}
