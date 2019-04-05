import { Component, Input, OnInit } from '@angular/core';
import { ErrorDetails, ErrorSummary } from '@core/model/errorSummary.model';
import { FormControl, FormGroup } from '@angular/forms';
import { filter } from 'lodash';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-error-summary',
  templateUrl: './error-summary.component.html',
  styleUrls: ['./error-summary.component.scss'],
})
export class ErrorSummaryComponent implements OnInit {
  @Input() public form: FormGroup;
  @Input() public errorDetails: Array<ErrorDetails>;
  public errors: Array<ErrorSummary>;

  constructor(
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.errorSummaryService.syncFormErrorsEvent.subscribe(() => this.getFormErrors());
    this.form.valueChanges.subscribe(() => this.getFormErrors());
  }

  private getFormErrors(): void {
    this.errors = [];

    Object.keys(this.form.controls).forEach(key => {
      const isFormControl: boolean = this.form.get(key) instanceof FormControl;
      const isFormGroup: boolean = this.form.get(key) instanceof FormGroup;

      if (isFormControl) {
        this.collectFormControlError(this.form.get(key), key);
      } else if (isFormGroup) {
        const formGroupControls: any = this.form.get(key)['controls'];
        Object.keys(formGroupControls).forEach(i => this.collectFormControlError(formGroupControls[i], i));
      }
    });
  }

  /**
   * Pass in formControl and its name
   * And if there are errors
   * Add them to errors object in order to show in ui
   * @param formControl
   * @param formControlName
   */
  private collectFormControlError(formControl, formControlName: string): void {
    if (formControl.errors) {
      this.errors.push({
        formControlName: formControlName,
        errors: [...Object.keys(formControl.errors)]
      });
    }
  }

  /**
   * Pass in formControlName and errorType
   * And return error message
   * @param formControlName
   * @param errorType
   */
  public getErrorMessage(formControlName: string, errorType: string): string {
    const getFormControl: Object = filter(this.errorDetails, [ 'formControlName', formControlName ])[0];
    return filter(getFormControl['type'], [ 'name', errorType ])[0].message;
  }

}
