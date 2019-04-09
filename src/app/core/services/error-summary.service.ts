import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { filter } from 'lodash';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';

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
   * errorType and formErrorsMap
   * Then return error message
   * @param item
   * @param errorType
   * @param errorDetails
   */
  public getFormErrorMessage(item: string, errorType: string, formErrorsMap: Array<ErrorDetails>): string {
    const getFormControl: Object = filter(formErrorsMap, [ 'item', item ])[0];
    return filter(getFormControl['type'], [ 'name', errorType ])[0].message;
  }

  /**
   * Pass in error code and serverErrorsMap
   * Then return error message
   * @param name
   * @param errorDefinitions
   */
  public getServerErrorMessage(name: number, serverErrorsMap: Array<ErrorDefinition>): string {
    return filter(serverErrorsMap, [ 'name', name ])[0].message;
  }
}
