import { Component, OnDestroy, OnInit } from '@angular/core';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-selected-files-list',
  templateUrl: './selected-files-list.component.html',
})
export class SelectedFilesListComponent implements OnInit, OnDestroy {
  public selectedFiles: File[];
  private subscriptions: Subscription = new Subscription();

  constructor(private bulkUploadService: BulkUploadService) {}

  ngOnInit() {
    this.setupSubscription();
  }

  public transformFileSize(fileSize: number): string {
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

  public getFileType(fileName: string): string {
    return this.bulkUploadService.getFileType(fileName);
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.selectedFiles$
        .pipe(distinctUntilChanged())
        .subscribe((selectedFiles: File[]) => (this.selectedFiles = selectedFiles))
    );
  }

  /**
   * Unsubscribe to ensure no memory leaks
   */
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
