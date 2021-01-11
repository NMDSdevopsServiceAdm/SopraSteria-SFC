import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorReport, NumberOfErrorsAndWarnings } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  public errorReport: ErrorReport;
  public numberOfErrorsAndWarnings: NumberOfErrorsAndWarnings;
  private subscriptions: Subscription = new Subscription();

  constructor(private bulkuploadService: BulkUploadService, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    const workplaceId = this.establishmentService.primaryWorkplace.uid;
    this.getErrorReport(workplaceId);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getErrorReport(workplaceId: string) {
    this.subscriptions.add(
      this.bulkuploadService.errorReport(workplaceId).subscribe((errorReport: ErrorReport) => {
        this.errorReport = errorReport;
        this.getNumberOfErrorsAndWarnings();
      }),
    );
  }

  private getNumberOfErrorsAndWarnings() {
    this.numberOfErrorsAndWarnings = {
      establishments: {
        errors: this.errorReport.establishments.errors.length,
        warnings: this.errorReport.establishments.warnings.length,
      },
      workers: {
        errors: this.errorReport.workers.errors.length,
        warnings: this.errorReport.workers.warnings.length,
      },
      training: {
        errors: this.errorReport.training.errors.length,
        warnings: this.errorReport.training.warnings.length,
      },
    };
  }
}
