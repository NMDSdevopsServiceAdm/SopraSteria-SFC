import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, LocalIdentifiersRequest } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { orderBy } from 'lodash';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { BulkUploadReferencesDirective } from '../bulk-upload-references.directive';

@Component({
  selector: 'app-bu-staff-references-page',
  templateUrl: 'staff-references.component.html',
  styleUrls: ['staff-references.component.html'],
  providers: [I18nPluralPipe],
})
export class StaffReferencesComponent extends BulkUploadReferencesDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  private maxLength = 50;
  public form: FormGroup;
  public references: Worker[] = [];
  private primaryWorkplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public formErrorsMap: ErrorDetails[] = [];
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public submitted = false;
  public return: URLStructure = { url: ['/dev', 'bulk-upload', 'workplace-references'] };
  private establishmentUid: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    private breadcrumbService: BreadcrumbService,
    private workerService: WorkerService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.establishmentUid = this.activatedRoute.snapshot.paramMap.get('uid');
    this.references = this.activatedRoute.snapshot.data.references;
    this.references = orderBy(
      this.activatedRoute.snapshot.data.references,
      [(worker: Worker) => worker.nameOrId.toLowerCase()],
      ['asc'],
    );
    this.setupForm();
    this.setServerErrors();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setupForm(): void {
    this.submitted = false;
    this.form = this.formBuilder.group({}, { validator: this.checkDuplicates });
    this.references.forEach((reference: Worker) => {
      this.form.addControl(
        `reference-${reference.uid}`,
        new FormControl(reference.localIdentifier, [Validators.required, Validators.maxLength(this.maxLength)]),
      );

      this.formErrorsMap.push({
        item: `reference-${reference.uid}`,
        type: [
          {
            name: 'required',
            message: `Enter the missing workplace reference.`,
          },
          {
            name: 'maxlength',
            message: `The reference must be ${this.maxLength} characters or less.`,
          },
          {
            name: 'duplicate',
            message: `Enter a different workplace reference.`,
          },
        ],
      });
    });
  }

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
      this.serverErrorsMap[1].message += ` '${response.error.duplicateValue}' has previously been used.`;
    }

    this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  private setServerErrors() {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Service unavailable.',
      },
      {
        name: 400,
        message: `Unable to update workplace reference.`,
      },
    ];
  }

  protected save(): void {
    this.subscriptions.add(
      this.workerService
        .updateLocalIdentifiers(this.establishmentUid, this.generateRequest())
        .pipe(take(1))
        .subscribe(
          () => {
            this.router.navigate(['/dev', 'bulk-upload', 'workplace-references']);
          },
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/dev/bulk-upload/workplace-references'] });
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
}
