import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocalIdentifiersRequest } from '@core/model/establishment.model';
import { Workplace } from '@core/model/my-workplaces.model';
import { Worker } from '@core/model/worker.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ArrayUtil } from '@core/utils/array-util';

@Directive()
export class BulkUploadReferencesDirective implements AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted = false;
  public references: Array<Workplace | Worker> = [];
  public maxLength = 50;
  public formErrorsMap: ErrorDetails[] = [];
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];

  constructor(protected errorSummaryService: ErrorSummaryService, protected formBuilder: FormBuilder) {}

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setupForm(): void {
    this.submitted = false;
    this.form = this.formBuilder.group(
      {},
      {
        validator: this.checkDuplicates,
      },
    );
    this.references.forEach((reference: Workplace | Worker) => {
      this.form.addControl(
        `reference-${reference.uid}`,
        new FormControl(reference.localIdentifier, {
          validators: [Validators.required, Validators.maxLength(this.maxLength)],
          updateOn: 'submit',
        }),
      );

      this.formErrorsMap.push({
        item: `reference-${reference.uid}`,
        type: [
          {
            name: 'required',
            message: `Enter a unique reference for ${reference['name'] ? reference['name'] : reference['nameOrId']}`,
          },
          {
            name: 'maxlength',
            message: `Reference must be ${this.maxLength} characters or fewer`,
          },
          {
            name: 'duplicate',
            message: `Enter a different reference, this one has already been used`,
          },
        ],
      });
    });
  }

  public checkDuplicates(group: FormGroup): void {
    const controls = Object.values(group.controls);
    controls.map((control) => {
      if (control?.errors?.duplicate) {
        if (Object.keys(control.errors).length > 1) {
          delete control.errors.duplicate;
        } else {
          control.setErrors(null);
        }
      }
    });
    const dupes = ArrayUtil.getDuplicates(controls, 'value').filter((dupe) => dupe.dirty);
    dupes.map((dupe: AbstractControl) => dupe.setErrors({ ...dupe.errors, duplicate: true }));
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected generateRequest(): LocalIdentifiersRequest {
    return {
      localIdentifiers: Object.keys(this.form.value).map((key) => ({
        uid: key.replace('reference-', ''),
        value: this.form.value[key],
      })),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected save(): void {}

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected onError(response: HttpErrorResponse): void {
    if (response.status === 400) {
      this.serverErrorsMap[1].message += `Enter a different reference, this one has already been used`;
    }

    this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }
}
