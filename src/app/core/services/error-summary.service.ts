import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { filter } from 'lodash';
import { ErrorDetails } from '@core/model/errorSummary.model';

@Injectable({
  providedIn: 'root',
})
export class ErrorSummaryService {
  public syncFormErrorsEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(
    private router: Router,
  ) {}

  public scrollToErrorSummary(): void {
    this.router.navigate([this.getRouteName()], {
      fragment: 'error-summary-title',
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Return route only only
   * Without query params and/or fragments
   */
  private getRouteName(): string {
    let url: string = this.router.url;

    if (url.includes('?')) {
      url = url.split('?')[0];
    } else if (url.includes('#')) {
      url = url.split('#')[0];
    }

    return url;
  }

  /**
   * Pass in formGroup or formControl name,
   * errorType and errorDetails
   * Then return error message
   * @param item
   * @param errorType
   * @param errorDetails
   */
  public getErrorMessage(item: string, errorType: string, errorDetails: Array<ErrorDetails>): string {
    const getFormControl: Object = filter(errorDetails, [ 'item', item ])[0];
    return filter(getFormControl['type'], [ 'name', errorType ])[0].message;
  }
}
