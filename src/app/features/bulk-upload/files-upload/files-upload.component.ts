import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnInit } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { forkJoin, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

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
    this.selectedFiles = target['files'];
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
    const url1: Observable<string> = this.getPresignedUrl(this.selectedFiles[0].name);
    const url2: Observable<string> = this.getPresignedUrl(this.selectedFiles[1].name);
    const url3: Observable<string> = this.getPresignedUrl(this.selectedFiles[2].name);

    forkJoin([url1, url2, url3]).subscribe((urls: Array<string>) => {
      console.warn(urls);
    });
  }

  private getPresignedUrl(filename: string): Observable<any> {
    return this.bulkUploadService.getPresignedUrl(filename).pipe(map(data => data.urls));
  }
}
