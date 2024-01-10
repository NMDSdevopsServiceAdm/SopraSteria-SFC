import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorReport, NumberOfErrorsAndWarnings } from '@core/model/bulk-upload.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import saveAs from 'file-saver';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  public errorReport: ErrorReport = this.route.snapshot.data.buErrors;
  public workplaceId: string;
  public now: Date = new Date();
  public numberOfErrorsAndWarnings: NumberOfErrorsAndWarnings;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private bulkuploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.workplaceId = this.establishmentService.primaryWorkplace.uid;
    this.getNumberOfErrorsAndWarnings();
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getNumberOfItems(errorsOrWarnings) {
    return errorsOrWarnings.reduce((num, errorInfo) => num + errorInfo.items.length, 0);
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
        errors: this.getNumberOfItems(this.errorReport.establishments.errors),
        warnings: this.getNumberOfItems(this.errorReport.establishments.warnings),
      },
      workers: {
        errors: this.getNumberOfItems(this.errorReport.workers.errors),
        warnings: this.getNumberOfItems(this.errorReport.workers.warnings),
      },
      training: {
        errors: this.getNumberOfItems(this.errorReport.training.errors),
        warnings: this.getNumberOfItems(this.errorReport.training.warnings),
      },
    };
  }
}
