import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorReport } from '@core/model/bulk-upload.model';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  providers: [{ provide: BulkUploadService, useClass: BulkUploadServiceV2 }],
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  public errorReport: ErrorReport;
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
      }),
    );
  }
}
