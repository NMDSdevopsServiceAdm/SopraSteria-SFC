import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnInit } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
      this.getPresignedUrls();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private getPresignedUrls(): void {
    this.bulkUploadService.getPresignedUrl(this.selectedFiles[0].name).subscribe((data: any) => {
      console.log('data', data);
    });
  }
}
