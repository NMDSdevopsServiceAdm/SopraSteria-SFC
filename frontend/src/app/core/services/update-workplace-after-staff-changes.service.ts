import { Injectable } from '@angular/core';
import { Starter, Vacancy, Leaver } from '@core/model/establishment.model';

@Injectable({
  providedIn: 'root',
})
export class UpdateWorkplaceAfterStaffChangesService {
  constructor() {}

  private visitedPages: Set<WorkplaceUpdatePage> = new Set();
  private _selectedVacancies: Vacancy[] = null;
  private _selectedStarters: Starter[] = null;
  private _selectedLeavers: Leaver[] = null;

  public addToVisitedPages(page: WorkplaceUpdatePage): void {
    this.visitedPages.add(page);
  }

  public resetVisitedPages(): void {
    this.visitedPages.clear();
  }

  public allUpdatePagesVisited(flowType: WorkplaceUpdateFlowType): boolean {
    const pages =
      flowType === WorkplaceUpdateFlowType.ADD ? AddStaffWorkplaceUpdatePage : DeleteStaffWorkplaceUpdatePage;

    return Object.values(pages).every((page) => {
      return this.visitedPages.has(page);
    });
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

  get selectedLeavers(): Vacancy[] {
    return this._selectedLeavers;
  }

  set selectedLeavers(updatedVacancies: Vacancy[]) {
    this._selectedLeavers = updatedVacancies;
  }
}

export enum AddStaffWorkplaceUpdatePage {
  TOTAL_STAFF = 'update-total-staff',
  UPDATE_VACANCIES = 'update-vacancies',
  UPDATE_STARTERS = 'update-starters',
}

export enum DeleteStaffWorkplaceUpdatePage {
  TOTAL_STAFF = 'update-total-staff',
  UPDATE_VACANCIES = 'update-vacancies',
  UPDATE_LEAVERS = 'update-leavers',
}

type WorkplaceUpdatePage = AddStaffWorkplaceUpdatePage | DeleteStaffWorkplaceUpdatePage;

export enum WorkplaceUpdateFlowType {
  ADD = 'ADD',
  DELETE = 'DELETE',
}
