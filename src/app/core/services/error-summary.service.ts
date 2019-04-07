import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ErrorSummaryService {
  public syncFormErrorsEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(
    private router: Router,
  ) {}

  public scrollToErrorSummary(): void {
    this.router.navigate([this.getRouteWithoutQueryParams()], {
      fragment: 'error-summary-title',
      queryParamsHandling: 'merge'
    });
  }

  private getRouteWithoutQueryParams(): string {
    return this.router.url.split('?')[0];
  }
}
