import { I18nPluralPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { AuthService } from '@core/services/auth.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = this.bulkUploadService.formErrorsMap();
  }

  public setupUploadValidationErrors(): void {
    this.subscriptions.add(
      this.bulkUploadService.validationErrors$
        .pipe(filter(uploadValidationErrors => uploadValidationErrors !== null))
        .subscribe(uploadValidationErrors => {
          this.uploadValidationErrors = uploadValidationErrors;
          this.showErrorSummary = uploadValidationErrors.length > 0;
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
