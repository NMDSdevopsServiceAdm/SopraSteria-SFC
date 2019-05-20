import { Component, OnDestroy, OnInit } from '@angular/core';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-uploaded-files-list',
  templateUrl: './uploaded-files-list.component.html',
})
export class UploadedFilesListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private uploadedFiles: Array<File>;

  constructor(private bulkUploadService: BulkUploadService) {}

  ngOnInit() {
    this.setupSubscription();
  }

  public setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.uploadedFiles$.subscribe((uploadedFiles: Array<File>) => {
        if (uploadedFiles) {
          this.uploadedFiles = uploadedFiles;
        }
      })
    );
  }

  public transformFileType(fileType: string): string {
    return this.bulkUploadService.transformFileType(fileType);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
