import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UploadFile, ValidatedFilesResponse } from '@core/model/bulk-upload.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-uploaded-files-list',
  templateUrl: './uploaded-files-list.component.html',
})
export class UploadedFilesListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private uploadedFiles: Array<UploadFile>;
  public isValidating = false;

  constructor(private bulkUploadService: BulkUploadService, private errorSummaryService: ErrorSummaryService) {}

  ngOnInit() {
    this.setupSubscription();
  }

  public setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.uploadedFiles$.subscribe((uploadedFiles: Array<UploadFile>) => {
        if (uploadedFiles) {
          this.uploadedFiles = uploadedFiles;
        }
      })
    );
  }

  public validateFiles(): void {
    this.isValidating = true;

    this.subscriptions.add(
      this.bulkUploadService.validateFiles().subscribe(
        (response: ValidatedFilesResponse) => {
          this.isValidating = false;
          console.log(response);
        },
        (error: HttpErrorResponse) => {
          // TODO
          // this.serverError = this.errorSummaryService.getServerErrorMessage(
          //   error.status,
          //   this.bulkUploadService.serverErrorsMap()
          // );
          // this.errorSummaryService.scrollToErrorSummary();
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
