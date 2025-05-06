import { Injectable } from '@angular/core';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';

@Injectable({
  providedIn: 'root',
})
export class VacanciesAndTurnoverService {
  constructor() {}

  private visitedPages: Set<WorkplaceUpdatePage> = new Set();
  private submittedPages: Set<WorkplaceUpdatePage> = new Set();
  private _selectedVacancies: Vacancy[] = null;
  private _selectedStarters: Starter[] = null;
  private _selectedLeavers: Leaver[] = null;
  private _hasViewedSavedBanner: boolean = false;
  private _doYouWantToAddOrDeleteAnswer: DoYouWantToAddOrDeleteAnswer = null;

  public addToVisitedPages(page: WorkplaceUpdatePage): void {
    this.visitedPages.add(page);
  }

  public allUpdatePagesVisited(flowType: WorkplaceUpdateFlowType): boolean {
    const pages =
      flowType === WorkplaceUpdateFlowType.ADD ? addStaffWorkplaceUpdatePages : deleteStaffWorkplaceUpdatePages;

    return pages.every((page) => {
      return this.visitedPages.has(page);
    });
  }

  public addToSubmittedPages(page: WorkplaceUpdatePage): void {
    this.submittedPages.add(page);
  }

  public allUpdatePagesSubmitted(flowType: WorkplaceUpdateFlowType): boolean {
    const pages =
      flowType === WorkplaceUpdateFlowType.ADD ? addStaffWorkplaceUpdatePages : deleteStaffWorkplaceUpdatePages;

    return pages.every((page) => {
      return this.submittedPages.has(page);
    });
  }

  public resetVisitedAndSubmittedPages(): void {
    this.visitedPages.clear();
    this.submittedPages.clear();
    this._hasViewedSavedBanner = false;
  }

  public clearAllSelectedJobRoles() {
    this.selectedVacancies = null;
    this.selectedStarters = null;
    this.selectedLeavers = null;
  }

  get selectedVacancies(): Vacancy[] {
    return this._selectedVacancies;
  }

  set selectedVacancies(updatedVacancies: Vacancy[]) {
    this._selectedVacancies = updatedVacancies;
  }

  get selectedStarters(): Starter[] {
    return this._selectedStarters;
  }

  set selectedStarters(updatedStarters: Starter[]) {
    this._selectedStarters = updatedStarters;
  }

  get selectedLeavers(): Leaver[] {
    return this._selectedLeavers;
  }

  set selectedLeavers(updatedLeavers: Leaver[]) {
    this._selectedLeavers = updatedLeavers;
  }

  get hasViewedSavedBanner(): boolean {
    return this._hasViewedSavedBanner;
  }

  set hasViewedSavedBanner(hasViewed: boolean) {
    this._hasViewedSavedBanner = hasViewed;
  }

  get doYouWantToAddOrDeleteAnswer(): DoYouWantToAddOrDeleteAnswer {
    return this._doYouWantToAddOrDeleteAnswer;
  }

  set doYouWantToAddOrDeleteAnswer(answer: DoYouWantToAddOrDeleteAnswer) {
    this._doYouWantToAddOrDeleteAnswer = answer;
  }

  public clearDoYouWantToAddOrDeleteAnswer(): void {
    this._doYouWantToAddOrDeleteAnswer = null;
  }
}

export enum WorkplaceUpdatePage {
  TOTAL_STAFF = 'update-total-staff',
  UPDATE_VACANCIES = 'update-vacancies',
  UPDATE_STARTERS = 'update-starters',
  UPDATE_LEAVERS = 'update-leavers',
}

const addStaffWorkplaceUpdatePages = [
  WorkplaceUpdatePage.TOTAL_STAFF,
  WorkplaceUpdatePage.UPDATE_VACANCIES,
  WorkplaceUpdatePage.UPDATE_STARTERS,
];

const deleteStaffWorkplaceUpdatePages = [
  WorkplaceUpdatePage.TOTAL_STAFF,
  WorkplaceUpdatePage.UPDATE_VACANCIES,
  WorkplaceUpdatePage.UPDATE_LEAVERS,
];

export enum WorkplaceUpdateFlowType {
  ADD = 'ADD',
  DELETE = 'DELETE',
}

export enum DoYouWantToAddOrDeleteAnswer {
  YES = 'Yes',
  NO = 'No',
}
