import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { allMandatoryTrainingCategories, TrainingCategory, TrainingCategoryResponse } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  public selectedTraining = null;
  public selectedStaff: Worker[] = [];
  public addMultipleTrainingInProgress$ = new BehaviorSubject<boolean>(false);
  private _trainingOrQualificationPreviouslySelected: string = null;
  private _trainingCategorySelectedForTrainingRecord: {};

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

  getCategoryById(categoryId): Observable<TrainingCategory[]> {
    return this.http
      .get<TrainingCategoryResponse>(`${environment.appRunnerEndpoint}/api/trainingCategories/${categoryId}`)
      .pipe(map((res) => res.trainingCategories));
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

  public updateSelectedTraining(formValue): void {
    this.selectedTraining = formValue;
  }

  public resetSelectedTraining(): void {
    this.selectedTraining = null;
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
  }

  public getTrainingCategorySelectedForTrainingRecord() {
    return this._trainingCategorySelectedForTrainingRecord;
  }
  public setTrainingCategorySelectedForTrainingRecord(trainingCategoryId: {}) {
    this._trainingCategorySelectedForTrainingRecord = trainingCategoryId;
  }
}
