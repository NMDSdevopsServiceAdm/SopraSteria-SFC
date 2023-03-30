/* eslint-disable @typescript-eslint/no-empty-function */
import { Directive, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails, ErrorSummary } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Directive()
export class ErrorSummaryDirective implements OnInit, OnDestroy {
  @Input() public form: UntypedFormGroup;
  @Input() public formErrorsMap: ErrorDetails[];
  @Input() public serverError?: string;
  @Input() public customErrors?: ErrorDefinition[];
  @ViewChild('errorSummary', { static: true }) private errorSummaryElement: ElementRef;
  protected subscriptions: Subscription = new Subscription();
  public errors: ErrorSummary[];

  constructor(protected errorSummaryService: ErrorSummaryService, protected router: Router) {}

  ngOnInit(): void {
    this.setKeyboardFocus();
    this.init();
  }

  protected init(): void {}
  protected getFormErrors(): void {}

  /**
   * As per GDS toolkit the error summary
   * needs to gain keyboard focus upon initialisation
   */
  protected setKeyboardFocus(): void {
    this.errorSummaryElement.nativeElement.focus();
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  /**
   * Check if abstract control name is nested and replace periods with hypens
   * This is because scrolling to a fragment such as `group.someNestedControl` does not work
   * @param item
   */
  private transformFragmentName(item: string): string {
    return item.replace(/[.]/g, '-');
  }

  public focusOnField(item: string): void {
    this.errorSummaryService.errorId$.next(item);
  }

  public getErrorId(item: string): string {
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
