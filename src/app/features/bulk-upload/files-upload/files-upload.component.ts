import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component, OnInit } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { forkJoin, Observable } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { mergeMap, take } from 'rxjs/operators';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
})
export class FilesUploadComponent implements OnInit {
  private form: FormGroup;
  private selectedFiles: Array<File>;
  private submitted = false;
  public filesUploading = false;

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

  get fileUpload(): AbstractControl {
    return this.form.get('fileUpload');
  }

  private onFilesSelection($event: Event): void {
    const target = $event.target || $event.srcElement;
    this.selectedFiles = Array.from(target['files']);

    this.fileUpload.setValidators(CustomValidators.checkFiles(this.fileUpload, this.selectedFiles));
    this.bulkUploadService.selectedFiles$.next(this.selectedFiles);
    this.bulkUploadService.exposeFormEvent$.next(this.form);
    this.errorSummaryService.syncFormErrorsEvent.next(true);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.bulkUploadService.exposeFormEvent$.next(this.form);
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.uploadFiles();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private uploadFiles(): void {
    this.filesUploading = true;

    forkJoin(
      this.selectedFiles.map((file: File) =>
        this.getPresignedUrl(file)
          .pipe(take(1))
          .pipe(mergeMap((signedURL: string) => this.uploadFile(file, signedURL)))
      )
    )
    .pipe(take(1))
    .subscribe(
      () => {
        this.filesUploading = false;
      },
      () => {
        this.filesUploading = false;
      }
    );
  }

  private getPresignedUrl(file: File): Observable<string> {
    return this.bulkUploadService.getPresignedUrl(file.name);
  }

  private uploadFile(file: File, signedURL: string): Observable<string> {
    return this.bulkUploadService.uploadFile(file, signedURL);
  }

  public removeFiles(): void {
    this.form.reset();
    this.submitted = false;
    this.selectedFiles = [];
    this.bulkUploadService.selectedFiles$.next(this.selectedFiles);
    this.bulkUploadService.exposeFormEvent$.next(this.form);
    this.errorSummaryService.syncFormErrorsEvent.next(true);
  }

  public cancelUpload(): void {
    console.log('cancel upload');
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.bulkUploadService.formErrorsMap());
  }
}
