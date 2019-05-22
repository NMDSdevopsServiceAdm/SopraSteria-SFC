import { Component, OnDestroy, OnInit } from '@angular/core';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { UploadFile } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-selected-files-list',
  templateUrl: './selected-files-list.component.html',
})
export class SelectedFilesListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private selectedFiles: Array<UploadFile>;

  constructor(private bulkUploadService: BulkUploadService) {}

  ngOnInit() {
    this.setupSubscription();
  }

  private transformFileSize(fileSize: number): string {
    const fileSizeInKB: number = Math.round(fileSize / 1000);

    if (fileSizeInKB < 1) {
      return `${fileSize} BYTES`;
    } else {
      if (fileSizeInKB < 1024) {
        return `${fileSizeInKB} KB`;
      } else {
        return `${Math.round(fileSizeInKB / 1024)} MB`;
      }
    }
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.selectedFiles$.pipe(distinctUntilChanged()).subscribe((selectedFiles: Array<UploadFile>) => {
        if (selectedFiles) {
          this.selectedFiles = selectedFiles;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
