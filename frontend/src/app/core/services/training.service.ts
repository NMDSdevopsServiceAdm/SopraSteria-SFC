import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { mandatoryTraining } from '@core/model/establishment.model';
import { allMandatoryTrainingCategories, SelectedTraining, TrainingCategory } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { BehaviorSubject, Observable } from 'rxjs';
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
