import { Component } from '@angular/core';
import { ErrorSummaryDirective } from '@shared/directives/error-summary/error-summary.directive';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-select-staff-error-summary',
  templateUrl: '../../../../shared/directives/error-summary/error-summary.component.html',
})
export class SelectStaffErrorSummaryComponent extends ErrorSummaryDirective {
  protected init(): void {
    this.subscriptions.add(
      this.errorSummaryService.syncErrorsEvent.subscribe(() => {
        this.getFormErrors();
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

  protected getFormErrors(): void {
    this.errors = [];

    this.formErrorsMap.forEach((error) => {
      this.errors.push({
        item: error.item,
        errors: [error.type[0].name.toString()],
      });
    });
  }
}
