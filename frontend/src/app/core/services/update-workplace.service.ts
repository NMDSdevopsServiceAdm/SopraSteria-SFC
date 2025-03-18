import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UpdateWorkplaceService {
  constructor() {}

  private visitedPages: Array<string> = [];

  public addToVisitedPages(page: string): void {
    this.visitedPages.push(page);
  }

  public getVisitedPages(): Array<string> {
    return this.visitedPages;
  }

  public resetVisitedPages(): void {
    this.visitedPages = [];
  }

  public allUpdatePagesVisitedForAdd(): boolean {
    return ['update-total-staff', 'update-vacancies', 'update-starters'].every((page) => {
      return this.visitedPages.includes(page);
    });
  }
}
