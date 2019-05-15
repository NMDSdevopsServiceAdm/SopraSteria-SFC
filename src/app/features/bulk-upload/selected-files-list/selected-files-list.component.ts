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

  constructor(
    private bulkUploadService: BulkUploadService
  ) {}

  ngOnInit() {
    this.setupSubscription();
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.selectedFiles$
        .pipe(distinctUntilChanged())
        .subscribe((selectedFiles: Array<File>) => {
          console.log(selectedFiles);
          this.selectedFiles = selectedFiles;
        })
    );
  }

  private removeFile($event: Event, fileName: string): void {
    $event.preventDefault();
    console.log(fileName);
  }
}
