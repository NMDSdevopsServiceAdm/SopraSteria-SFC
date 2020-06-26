import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild, Directive } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, LocalIdentifiersRequest } from '@core/model/establishment.model';
import { Workplace } from '@core/model/my-workplaces.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Directive()
export class BulkUploadReferences implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  protected maxLength = 120;
  protected subscriptions: Subscription = new Subscription();
  public establishmentName: string;
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[] = [];
  public primaryEstablishmentName: string;
  public primaryWorkplace: Establishment;
  public references: Array<Workplace | Worker> = [];
  public referenceType: string;
  public referenceTypeEnum = BulkUploadFileType;
  public remainingEstablishments: number;
  public renderForm = false;
  public returnTo: URLStructure;
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public submitted = false;
  public addStaffRoute: URLStructure;

  constructor(
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
  ) {
    this.setPrimaryEstablishmentName();
  }

  ngOnInit() {
    this.init();
    this.setServerErrors();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init() {}

  private setPrimaryEstablishmentName(): void {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.primaryEstablishmentName = this.primaryWorkplace.name;
  }

  protected setupForm(): void {
    this.submitted = false;
    this.form = this.formBuilder.group({});
    this.references = this.references.filter(item => item.ustatus !== 'PENDING');
    this.references.forEach((reference: Workplace | Worker) => {
      this.form.addControl(
        `reference-${reference.uid}`,
        new FormControl(reference.localIdentifier, [Validators.required, Validators.maxLength(this.maxLength)]),
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
      }),
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
        uid: key.replace('reference-', ''),
        value: this.form.value[key],
      })),
    };
  }

  protected save(saveAndContinue: boolean): void {}

  public onSubmit(event: Event, saveAndContinue: boolean): void {
    event.preventDefault();
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
