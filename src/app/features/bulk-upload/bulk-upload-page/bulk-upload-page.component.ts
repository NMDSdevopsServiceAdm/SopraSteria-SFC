import { I18nPluralPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { AuthService } from '@core/services/auth.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-bulk-upload-page',
  templateUrl: './bulk-upload-page.component.html',
  providers: [I18nPluralPipe],
})
export class BulkUploadPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public establishment: LoggedInEstablishment | null;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public uploadValidationErrors: Array<ErrorDefinition>;
  public serverError: string;
  public showErrorSummary: boolean;

  constructor(
    private authService: AuthService,
    private bulkUploadService: BulkUploadService,
    private errorSummaryService: ErrorSummaryService
  ) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
    this.setupFormErrorsMap();
    this.setupUploadValidationErrors();
    this.setupSubscription();
    this.bulkUploadService.uploadComplete$.next(false);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = this.bulkUploadService.formErrorsMap();
  }

  public setupUploadValidationErrors(): void {
    this.subscriptions.add(
      combineLatest(this.bulkUploadService.validationErrors$, this.bulkUploadService.serverError$).subscribe(
        ([uploadValidationErrors, serverError]) => {
          this.uploadValidationErrors = uploadValidationErrors;
          this.serverError = serverError;
          this.showErrorSummary = (!!uploadValidationErrors && uploadValidationErrors.length > 0) || !!serverError;

          if (this.showErrorSummary) {
            this.errorSummaryService.scrollToErrorSummary();
          }
        }
      )
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
    this.bulkUploadService.clearPreviousErrors();
    this.subscriptions.unsubscribe();
  }
}
