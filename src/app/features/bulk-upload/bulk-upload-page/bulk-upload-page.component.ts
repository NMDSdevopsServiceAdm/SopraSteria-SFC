import { AuthService } from '@core/services/auth.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDetails } from '@core/model/errorSummary.model';
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

  constructor(private authService: AuthService, private bulkUploadService: BulkUploadService) {}

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
      this.bulkUploadService.exposeFormEvent$
        .subscribe((form: FormGroup) => {
          if (form) {
            console.log('form.invalid', form.invalid);
            this.showErrorSummary = form.invalid;
            this.form = form;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
