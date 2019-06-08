import { AuthService } from '@core/services/auth.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormGroup } from '@angular/forms';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bulk-upload-page',
  templateUrl: './bulk-upload-page.component.html',
})
export class BulkUploadPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public establishment: LoggedInEstablishment | null;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public showErrorSummary: boolean;

  constructor(
    private authService: AuthService,
    private bulkUploadService: BulkUploadService,
    private errorSummaryService: ErrorSummaryService
  ) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
    this.setupFormErrorsMap();
    this.setupSubscription();
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = this.bulkUploadService.formErrorsMap();
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
   * And set selected files to none otherwise
   * on route revisit the selected files are cached
   */
  ngOnDestroy() {
    this.bulkUploadService.selectedFiles$.next(null);
    this.subscriptions.unsubscribe();
  }
}
