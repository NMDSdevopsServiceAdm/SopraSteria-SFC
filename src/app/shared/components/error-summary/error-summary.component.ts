import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { ErrorDefinition, ErrorDetails, ErrorSummary } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-summary',
  templateUrl: './error-summary.component.html',
})
export class ErrorSummaryComponent implements OnInit, OnDestroy {
  @Input() public form: FormGroup;
  @Input() public formErrorsMap: Array<ErrorDetails>;
  @Input() public serverError?: string;
  @Input() public customErrors?: Array<ErrorDefinition>;
  @ViewChild('errorSummary') private errorSummaryElement: ElementRef;
  private subscriptions: Subscription = new Subscription();
  public errors: Array<ErrorSummary>;

  constructor(private errorSummaryService: ErrorSummaryService) {}

  ngOnInit(): void {
    this.setKeyboardFocus();
    if (this.form) {
      this.subscriptions.add(
        this.errorSummaryService.syncFormErrorsEvent.subscribe(() => {
          this.getFormErrors();
          this.setKeyboardFocus();
        })
      );
      this.subscriptions.add(this.form.valueChanges.subscribe(() => this.getFormErrors()));
    }
  }

  /**
   * As per GDS toolkit the error summary
   * needs to gain keyboard focus upon initialisation
   */
  private setKeyboardFocus(): void {
    this.errorSummaryElement.nativeElement.focus();
  }

  private getFormErrors(): void {
    this.errors = [];

    Object.keys(this.form.controls).forEach(key => {
      const isFormControl: boolean = this.form.get(key) instanceof FormControl;
      const isFormGroup: boolean = this.form.get(key) instanceof FormGroup;
      const isFormArray: boolean = this.form.get(key) instanceof FormArray;

      if (isFormControl) {
        this.collectError(this.form.get(key), key);
      } else if (isFormGroup) {
        const formGroup: AbstractControl = this.form.get(key);

        if (formGroup.errors) {
          Object.keys(formGroup.errors).forEach(i => this.collectError(formGroup, key));
        }

        const formGroupControls: AbstractControl = formGroup['controls'];
        Object.keys(formGroupControls).forEach(i => this.collectError(formGroupControls[i], `${key}.${i}`));
      } else if (isFormArray) {
        const formArray = <FormArray>this.form.get(key);

        formArray.controls.forEach(formGroup => {
          if (formGroup.errors) {
            Object.keys(formGroup.errors).forEach(() => this.collectError(formGroup, key));
          }

          const formGroupControls: AbstractControl = formGroup['controls'];
          if (formGroupControls) {
            Object.keys(formGroupControls).forEach(i => this.collectError(formGroupControls[i], `${key}.${i}`));
          }
        });
      }
    });
  }

  /**
   * Pass in formControl or formGroup and its name
   * And if there are errors
   * Add them to errors object in order to show in ui
   * @param item
   * @param name
   */
  private collectError(item: AbstractControl, name: string): void {
    if (item.errors) {
      this.errors.push({
        item: name,
        errors: [...Object.keys(item.errors)],
      });
    }
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
    return item.replace('.', '-');
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
