import { Component, OnInit } from '@angular/core';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-selected-files-list',
  templateUrl: './selected-files-list.component.html',
})
export class SelectedFilesListComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  private selectedFiles: Array<File>;

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

  private transformFileType(fileType: string): string {
    return fileType
      .split('/')
      .pop()
      .toUpperCase();
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.selectedFiles$.pipe(distinctUntilChanged()).subscribe((selectedFiles: Array<File>) => {
        if (selectedFiles) {
          this.selectedFiles = selectedFiles;
        }
      })
    );
  }
}
