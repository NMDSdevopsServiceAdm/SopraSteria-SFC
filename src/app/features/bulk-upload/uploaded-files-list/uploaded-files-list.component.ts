import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { UploadFile, ValidatedFilesResponse, FileValidateStatus } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-uploaded-files-list',
  templateUrl: './uploaded-files-list.component.html',
})
export class UploadedFilesListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private uploadedFiles: Array<UploadFile>;
  public isValidating = false;

  constructor(private bulkUploadService: BulkUploadService) {}

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
    this.uploadedFiles.map((file: UploadFile) => file.status = FileValidateStatus.Validating);

    this.subscriptions.add(
      this.bulkUploadService.validateFiles().subscribe(
        (response: ValidatedFilesResponse) => {
          this.finishValidating(response);
        },
        (response: HttpErrorResponse) => {
          this.finishValidating(response);
        }, () => {
          this.finishValidating();
        }
      )
    );
  }

  /**
   * TODO update once BE api is able to return a 200 response on successful validate
   * as well as once BE api is able to provide erros back on a file
   * @param response
   */
  private finishValidating(response?: ValidatedFilesResponse | HttpErrorResponse): void {
    this.uploadedFiles.map((file: UploadFile) => file.status = null);
    this.isValidating = false;
    console.clear();
    console.log(response);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
