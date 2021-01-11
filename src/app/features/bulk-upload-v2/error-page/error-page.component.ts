import { HttpResponse } from '@angular/common/http';
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
  public workplaceId: string;
  public numberOfErrorsAndWarnings: NumberOfErrorsAndWarnings;
  private subscriptions: Subscription = new Subscription();

  constructor(private bulkuploadService: BulkUploadService, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.workplaceId = this.establishmentService.primaryWorkplace.uid;
    this.getErrorReport();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getErrorReport() {
    this.subscriptions.add(
      this.bulkuploadService.errorReport(this.workplaceId).subscribe((errorReport: ErrorReport) => {
        this.errorReport = errorReport;
        this.getNumberOfErrorsAndWarnings();
      }),
    );
  }

  public downloadBUReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.bulkuploadService.getBUReport(this.workplaceId).subscribe((response) => {
        this.saveFile(response);
      }),
    );
  }

  private saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
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
