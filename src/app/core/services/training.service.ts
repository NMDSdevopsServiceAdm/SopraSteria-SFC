import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { allMandatoryTrainingCategories, TrainingCategory, TrainingCategoryResponse } from '@core/model/training.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  public selectedTraining: any;
  public selectedStaff = [];
  public addMultipleTrainingInProgress$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getCategories(): Observable<TrainingCategory[]> {
    return this.http
      .get<TrainingCategoryResponse>('/api/trainingCategories')
      .pipe(map((res) => res.trainingCategories));
  }

  public updateSelectedStaff(formValue) {
    this.selectedStaff = formValue;
  }

  public resetSelectedStaff(): void {
    this.selectedStaff = [];
  }

  //get all mandatory training
  public getAllMandatoryTrainings(establishmentId): Observable<allMandatoryTrainingCategories> {
    return this.http.get<allMandatoryTrainingCategories>(`/api/establishment/${establishmentId}/mandatoryTraining`);
  }
}
