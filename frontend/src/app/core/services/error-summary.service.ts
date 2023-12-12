import { ElementRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import filter from 'lodash/filter';
import { BehaviorSubject } from 'rxjs';
import * as parse from 'url-parse';

@Injectable({
  providedIn: 'root',
})
export class ErrorSummaryService {
  public syncFormErrorsEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public syncErrorsEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public formEl$: BehaviorSubject<ElementRef> = new BehaviorSubject(null);
  public errorId$: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(private router: Router) {}

  public scrollToErrorSummary(): void {
    this.router.navigate([this.getRouteName()], {
      fragment: 'error-summary-title',
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * Return route only
   * Without query params and/or fragments
   */
  private getRouteName(): string {
    return parse(this.router.url).pathname;
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
    const getFormControl: object = filter(formErrorsMap, ['item', item])[0];
    return filter(getFormControl[`type`], ['name', errorType])[0].message;
  }

  /**
   * Pass in error code and serverErrorsMap
   * Then return error message
   * @param errorCode
   * @param errorDefinitions
   */
  public getServerErrorMessage(errorCode: number, serverErrorsMap: Array<ErrorDefinition>): string {
    const error: ErrorDefinition = filter(serverErrorsMap, ['name', errorCode])[0];
    return error ? error.message : `Server Error. code ${errorCode}`;
  }
}
