import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorDetails, ErrorSummary } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { combineLatest, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-select-staff-error-summary',
  templateUrl: './select-staff-error-summary.component.html',
})
export class SelectStaffErrorSummaryComponent implements OnInit, OnDestroy {
  @Input() public errorsMap: Array<ErrorDetails>;
  @ViewChild('errorSummary', { static: true }) private errorSummaryElement: ElementRef;
  private subscriptions: Subscription = new Subscription();
  public errors: Array<ErrorSummary>;

  constructor(private errorSummaryService: ErrorSummaryService, private router: Router) {}

  ngOnInit(): void {
    this.setKeyboardFocus();

    this.subscriptions.add(
      this.errorSummaryService.syncErrorsEvent.subscribe(() => {
        this.getErrors();
        this.setKeyboardFocus();
      }),
    );

    this.subscriptions.add(
      combineLatest([this.errorSummaryService.formEl$, this.errorSummaryService.errorId$])
        .pipe(filter(([formEl, errorId]) => formEl !== null && errorId !== null))
        .subscribe(([formEl, errorId]) => {
          const errorMessage = formEl.nativeElement.querySelector(`#${this.getErrorId(errorId)}`);
          if (errorMessage) {
            const errorWrapper = errorMessage.closest('div');
            const errorElement = errorWrapper ? errorWrapper.querySelector('a') : null;
            if (errorElement) {
              setTimeout(() => {
                errorElement.focus();
              }, 1);
            }
          }
        }),
    );
  }

  /**
   * As per GDS toolkit the error summary
   * needs to gain keyboard focus upon initialisation
   */
  private setKeyboardFocus(): void {
    this.errorSummaryElement.nativeElement.focus();
  }

  private getErrors(): void {
    this.errors = [];

    this.errorsMap.forEach((error) => {
      this.errors.push({
        item: error.item,
        errors: [error.type[0].name.toString()],
      });
    });
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.errorsMap);
  }

  /**
   * Check if abstract control name is nested and replace periods with hypens
   * This is because scrolling to a fragment such as `group.someNestedControl` does not work
   * @param item
   */
  private transformFragmentName(item: string): string {
    return item.replace(/[.]/g, '-');
  }

  public focusOnField(item: string) {
    this.errorSummaryService.errorId$.next(item);
  }

  public getErrorId(item: string) {
    return this.transformFragmentName(item) + '-error';
  }

  public getCurrentRoute(): string {
    return this.router.url.split('#')[0].split('?')[0];
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.errorSummaryService.formEl$.next(null);
    this.errorSummaryService.errorId$.next(null);
    this.subscriptions.unsubscribe();
  }
}
