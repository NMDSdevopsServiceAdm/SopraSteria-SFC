import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnInit } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
})
export class FilesUploadComponent implements OnInit {
  private form: FormGroup;
  private selectedFiles: Array<File>;
  private submitted = false;

  constructor(
    private bulkUploadService: BulkUploadService,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      fileUpload: [null, Validators.required],
    });
  }

  private onFilesSelection($event: Event): void {
    const target = $event.target || $event.srcElement;
    this.selectedFiles = Array.from(target['files']);
    this.bulkUploadService.selectedFiles$.next(this.selectedFiles);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.getAllPresignedUrls();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private getAllPresignedUrls(): void {
    this.selectedFiles.forEach((file: File) => {
      this.getPresignedUrl(file.name)
        .pipe(take(1))
        .subscribe((url: string) => this.uploadFile(url));
    });
  }

  private getPresignedUrl(filename: string): Observable<string> {
    return this.bulkUploadService.getPresignedUrl(filename).pipe(map(data => data.urls));
  }

  // TODO
  private uploadFile(uploadPath: string): void {
    console.log('uploadFile', uploadPath);
  }
}
