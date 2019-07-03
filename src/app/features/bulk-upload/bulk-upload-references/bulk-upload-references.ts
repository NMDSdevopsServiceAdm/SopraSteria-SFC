import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { Workplace } from '@core/model/my-workplaces.model';

export class BulkUploadReferences implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[] = [];
  public primaryEstablishmentName: string;
  public references: Array<Workplace | Worker> = [];
  public referenceType: string;
  public referenceTypeEnum = BulkUploadFileType;
  public return: URLStructure;
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public submitted = false;
  public establishmentName: string;
  public remainingEstablishments: number;

  constructor(
    protected authService: AuthService,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit() {
    this.init();
    this.setupForm();
    this.setPrimaryEstablishmentName();
    this.setServerErrors();
  }

  protected init() {}

  private setPrimaryEstablishmentName(): void {
    this.primaryEstablishmentName = this.authService.establishment ? this.authService.establishment.name : null;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({});
  }

  protected getReferences(establishmentUid?: string): void {}

  protected updateForm(): void {
    this.references.forEach((reference: Workplace | Worker) => {
      this.form.addControl(
        reference.uid,
        new FormControl(null, [Validators.required, this.uniqueValidator.bind(this)])
      );

      this.formErrorsMap.push({
        item: reference.uid,
        type: [
          {
            name: 'required',
            message: `Enter the missing ${this.referenceType.toLowerCase()} reference.`,
          },
          {
            name: 'unique',
            message: `Enter a different ${this.referenceType.toLowerCase()} reference.`,
          },
        ],
      });
    });
  }

  private setServerErrors() {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Service unavailable.',
      },
      {
        name: 400,
        message: `Unable to update ${this.referenceType.toLowerCase()} references.`,
      },
    ];
  }

  protected onError(error: HttpErrorResponse): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  protected uniqueValidator(control: AbstractControl): { [key: string]: boolean } | null  {
    const formValues: string[] = Object.values(this.form.value);
    const isDuplicate: boolean = formValues.includes(control.value);
    return isDuplicate ? { unique: true } : null;
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
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
