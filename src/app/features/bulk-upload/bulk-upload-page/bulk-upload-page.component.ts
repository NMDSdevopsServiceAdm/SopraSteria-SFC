import { I18nPluralPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-bulk-upload-page',
  templateUrl: './bulk-upload-page.component.html',
  providers: [I18nPluralPipe],
})
export class BulkUploadPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public establishment: Establishment;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public uploadValidationErrors: Array<ErrorDefinition>;
  public serverError: string;
  public showErrorSummary: boolean;

  constructor(
    private establishmentService: EstablishmentService,
    private bulkUploadService: BulkUploadService,
    private errorSummaryService: ErrorSummaryService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
    this.establishment = this.establishmentService.primaryWorkplace;
    this.setupFormErrorsMap();
    this.setupUploadValidationErrors();
    this.setupSubscription();
    this.bulkUploadService.setReturnTo(null);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = this.bulkUploadService.formErrorsMap();
  }

  public setupUploadValidationErrors(): void {
    this.subscriptions.add(
      combineLatest(
        this.bulkUploadService.preValidationError$,
        this.bulkUploadService.validationErrors$,
        this.bulkUploadService.serverError$
      ).subscribe(([preValidationErrors, uploadValidationErrors, serverError]) => {
        this.uploadValidationErrors = uploadValidationErrors;
        this.serverError = serverError;
        this.showErrorSummary =
          preValidationErrors || (!!uploadValidationErrors && uploadValidationErrors.length > 0) || !!serverError;
        if (this.showErrorSummary) {
          this.errorSummaryService.scrollToErrorSummary();
        }
      })
    );
  }

  public setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.exposeForm$.subscribe((form: FormGroup) => {
        if (form) {
          this.form = form;
          this.showErrorSummary = form.invalid;
          this.errorSummaryService.syncFormErrorsEvent.next(true);
        }
      })
    );
  }

  /**
   * Unsubscribe to ensure no memory leaks
   * And clear selected files, previous errors
   * when navigated away from bulk upload page
   */
  ngOnDestroy() {
    this.bulkUploadService.selectedFiles$.next(null);
    this.bulkUploadService.resetBulkUpload();
    this.subscriptions.unsubscribe();
  }
}
