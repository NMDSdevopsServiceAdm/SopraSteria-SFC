import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TrainingCategory, TrainingCategoryResponse, TrainingRecordCategories } from '@core/model/training.model';
import { TrainingAndQualificationRecords } from '@core/model/trainingAndQualifications.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  public selectedStaff = [];
  public addMultipleTrainingInProgress$ = new BehaviorSubject<boolean>(false);
  private _trainingOrQualificationPreviouslySelected: string = null;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<TrainingCategory[]> {
    return this.http
      .get<TrainingCategoryResponse>('/api/trainingCategories')
      .pipe(map((res) => res.trainingCategories));
  }

  getAllTrainingByStatus(workplaceUid: string, status: string): Observable<TrainingAndQualificationRecords> {
    return this.http.get<TrainingAndQualificationRecords>(
      `/api/establishment/${workplaceUid}/trainingAndQualifications/${status}`,
    );
  }

  getMissingMandatoryTraining(workplaceId): Observable<TrainingRecordCategories[]> {
    return this.http.get<any>(`/api/establishment/${workplaceId}/trainingAndQualifications/missing-training`);
  }

  public updateSelectedStaff(formValue) {
    this.selectedStaff = formValue;
  }

  public resetSelectedStaff(): void {
    this.selectedStaff = [];
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
}
