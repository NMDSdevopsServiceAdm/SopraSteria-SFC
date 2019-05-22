import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UploadFile } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-uploaded-files-list',
  templateUrl: './uploaded-files-list.component.html',
})
export class UploadedFilesListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private uploadedFiles: Array<UploadFile>;

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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
