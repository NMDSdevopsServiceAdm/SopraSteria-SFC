import { Component, OnDestroy, OnInit } from '@angular/core';
import { UploadFile } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-selected-files-list',
  templateUrl: './selected-files-list.component.html',
})
export class SelectedFilesListComponent implements OnInit, OnDestroy {
  public selectedFiles: Array<UploadFile>;
  private subscriptions: Subscription = new Subscription();

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
      this.bulkUploadService.selectedFiles$
        .pipe(distinctUntilChanged())
        .subscribe((selectedFiles: Array<UploadFile>) => {
          if (selectedFiles) {
            this.selectedFiles = selectedFiles;
          }
        })
    );
  }

  /**
   * Unsubscribe to ensure no memory leaks
   * And set selected files to none otherwise
   * on route revisit the selected files are cached
   */
  ngOnDestroy() {
    this.bulkUploadService.selectedFiles$.next(null);
    this.subscriptions.unsubscribe();
  }
}
