import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { mandatoryTraining } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import {
  allMandatoryTrainingCategories,
  SelectedTraining,
  TrainingCategory,
  TrainingRecordRequest,
} from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { DateUtil } from '@core/utils/date-util';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  protected _selectedTraining = null;
  public selectedStaff: Worker[] = [];
  public addMultipleTrainingInProgress$ = new BehaviorSubject<boolean>(false);
  private _trainingOrQualificationPreviouslySelected: string = null;
  public updatingSelectedStaffForMultipleTraining: boolean = null;
  private _isTrainingCourseSelected: boolean = null;
  private _selectedTrainingCourse: TrainingCourse;
  private _courseCompletionDate: Date = null;
  private _notes: string = null;

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

  public getSelectedStaff(): Worker[] {
    return this.selectedStaff;
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
    this.clearIsTrainingCourseSelected();
    this.clearSelectedTrainingCourse();
    this.clearCourseCompletionDate();
    this.clearNotes();
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

  public setIsTrainingCourseSelected(isCourseSelected: boolean): void {
    this._isTrainingCourseSelected = isCourseSelected;
  }

  public getIsTrainingCourseSelected(): boolean {
    return this._isTrainingCourseSelected;
  }

  public clearIsTrainingCourseSelected(): void {
    this._isTrainingCourseSelected = null;
  }

  public setSelectedTrainingCourse(selectedTrainingCourse: TrainingCourse): void {
    this._selectedTrainingCourse = selectedTrainingCourse;
  }

  public getSelectedTrainingCourse(): TrainingCourse {
    return this._selectedTrainingCourse;
  }

  public clearSelectedTrainingCourse(): void {
    this._selectedTrainingCourse = null;
  }

  public setCourseCompletionDate(date: Date): void {
    this._courseCompletionDate = date;
  }

  public getCourseCompletionDate(): Date {
    return this._courseCompletionDate;
  }

  public clearCourseCompletionDate(): void {
    this._courseCompletionDate = null;
  }

  public setNotes(notes: string): void {
    this._notes = notes;
  }

  public getNotes(): string {
    return this._notes;
  }

  public clearNotes(): void {
    this._notes = null;
  }

  public fillInExpiryDate(record: TrainingRecordRequest, completedDate: dayjs.Dayjs): TrainingRecordRequest {
    if (record.expires || !completedDate || !record.validityPeriodInMonth) {
      return record;
    }

    const calculatedExpiryDate = DateUtil.expectedExpiryDate(completedDate, record.validityPeriodInMonth);
    if (!calculatedExpiryDate) {
      return record;
    }

    return { ...record, expires: calculatedExpiryDate.format(DATE_PARSE_FORMAT) };
  }
}

@Injectable({
  providedIn: 'root',
})
export class MandatoryTrainingService extends TrainingService {
  _onlySelectedJobRoles: boolean = null;
  _mandatoryTrainingBeingEdited: mandatoryTraining = null;
  public allJobRolesCount: number;

  public get onlySelectedJobRoles(): boolean {
    return this._onlySelectedJobRoles;
  }

  public set onlySelectedJobRoles(onlySelected: boolean) {
    this._onlySelectedJobRoles = onlySelected;
  }

  public resetState(): void {
    this.onlySelectedJobRoles = null;
    this.mandatoryTrainingBeingEdited = null;
    super.resetState();
  }

  public set mandatoryTrainingBeingEdited(mandatoryTraining) {
    this._mandatoryTrainingBeingEdited = mandatoryTraining;
  }

  public get mandatoryTrainingBeingEdited(): mandatoryTraining {
    return this._mandatoryTrainingBeingEdited;
  }
}
