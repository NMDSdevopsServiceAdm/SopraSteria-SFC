import { AuthService } from '@core/services/auth.service';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalIdentifiersRequest } from '@core/model/establishment.model';
import { OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { Workplace } from '@core/model/my-workplaces.model';

export class BulkUploadReferences implements OnInit, OnDestroy {
  protected maxLength = 120;
  protected subscriptions: Subscription = new Subscription();
  public establishmentName: string;
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[] = [];
  public primaryEstablishmentName: string;
  public references: Array<Workplace | Worker> = [];
  public referenceType: string;
  public referenceTypeEnum = BulkUploadFileType;
  public remainingEstablishments: number;
  public renderForm = false;
  public return: URLStructure;
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public submitted = false;

  constructor(
    protected authService: AuthService,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService
  ) {}

  ngOnInit() {
    this.init();
    this.setPrimaryEstablishmentName();
    this.setServerErrors();
  }

  protected init() {}

  private setPrimaryEstablishmentName(): void {
    this.primaryEstablishmentName = this.authService.establishment ? this.authService.establishment.name : null;
  }

  protected getReferences(establishmentUid?: string): void {}

  protected setupForm(): void {
    this.form = this.formBuilder.group({});

    this.references.forEach((reference: Workplace | Worker) => {
      this.form.addControl(
        `reference-${reference.uid}`,
        new FormControl(reference.localIdentifier, [Validators.required, Validators.maxLength(this.maxLength)])
      );

      this.formErrorsMap.push({
        item: `reference-${reference.uid}`,
        type: [
          {
            name: 'required',
            message: `Enter the missing ${this.referenceType.toLowerCase()} reference.`,
          },
          {
            name: 'maxlength',
            message: `The reference must be ${this.maxLength} characters or less.`,
          },
          {
            name: 'duplicate',
            message: `Enter a different ${this.referenceType.toLowerCase()} reference.`,
          },
        ],
      });
    });

    this.renderForm = true;
    this.checkFormForDuplicates();
  }

  private checkFormForDuplicates(): void {
    this.subscriptions.add(
      this.form.valueChanges.subscribe(changes => {
        Object.keys(changes).forEach((key: string) => {
          const control = this.form.get(key);

          if (control.value && this.getDuplicates().includes(control.value.toLowerCase())) {
            control.setErrors({ duplicate: true });
          } else {
            if (control.errors && control.errors.hasOwnProperty('duplicate')) {
              control.setErrors(null);
            }
          }
        });
      })
    );
  }

  private setServerErrors() {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Service unavailable.',
      },
      {
        name: 400,
        message: `Unable to update ${this.referenceType.toLowerCase()} reference.`,
      },
    ];
  }

  /**
   * Handle BE api error
   * If 400 error capture the value update serverErrorsMap
   * In order for the error summary component to show the server error
   * @param response HttpErrorResponse
   */
  protected onError(response: HttpErrorResponse): void {
    if (response.status === 400) {
      this.serverErrorsMap[1].message += ` '${response.error.duplicateValue}' has previously been used.`;
    }

    this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  private getDuplicates(): string[] {
    let formValues: string[] = Object.values(this.form.value);
    formValues = formValues.map(value => value.toLowerCase());

    return formValues.filter((value: string) => {
      return formValues.indexOf(value) !== formValues.lastIndexOf(value);
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected generateRequest(): LocalIdentifiersRequest {
    return {
      localIdentifiers: Object.keys(this.form.value).map(key => ({
        uid: key,
        value: this.form.value[key],
      })),
    };
  }

  protected save(saveAndContinue: boolean): void {}

  public onSubmit(saveAndContinue: boolean): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save(saveAndContinue);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
