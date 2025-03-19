import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UpdateWorkplaceAfterStaffChangesService {
  constructor() {}

  private visitedPages: Set<AddStaffWorkplaceUpdatePage> = new Set();

  public addToVisitedPages(page: AddStaffWorkplaceUpdatePage): void {
    this.visitedPages.add(page);
  }

  public resetVisitedPages(): void {
    this.visitedPages.clear();
  }

  public allUpdatePagesVisitedForAdd(): boolean {
    return Object.values(AddStaffWorkplaceUpdatePage).every((page) => {
      return this.visitedPages.has(page);
    });
  }
}

export enum AddStaffWorkplaceUpdatePage {
  TOTAL_STAFF = 'update-total-staff',
  UPDATE_VACANCIES = 'update-vacancies',
  UPDATE_STARTERS = 'update-starters',
}
