import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadFile } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { combineLatest, forkJoin, Observable, Subscription } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
})
export class FilesUploadComponent implements OnInit {
  public form: FormGroup;
  public filesUploading = false;
  public filesUploaded = false;
  public submitted = false;
  private selectedFiles: Array<UploadFile>;
  private bytesTotal = 0;
  private bytesUploaded: number[] = [];
  private uploadSubscription$: Subscription;

  constructor(
    private bulkUploadService: BulkUploadService,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.setupForm();
  }

  public get progress(): number {
    const uploaded = this.bytesUploaded.reduce((sum, val) => (sum += val));
    const progress = Math.round((100 * uploaded) / this.bytesTotal);
    return progress;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      fileUpload: [null, Validators.required],
    });
  }

  get fileUpload(): AbstractControl {
    return this.form.get('fileUpload');
  }

  public onFilesSelection($event: Event): void {
    const target = $event.target || $event.srcElement;
    this.selectedFiles = Array.from(target['files']);
    this.selectedFiles.map((file: UploadFile) => (file.extension = this.bulkUploadService.getFileType(file.name)));

    this.fileUpload.setValidators(CustomValidators.checkFiles(this.fileUpload, this.selectedFiles));
    this.bulkUploadService.selectedFiles$.next(this.selectedFiles);

    if (this.submitted) {
      this.bulkUploadService.exposeForm$.next(this.form);
    }
  }

  public onSubmit(): void {
    this.submitted = true;
    this.bulkUploadService.exposeForm$.next(this.form);

    if (this.form.valid) {
      this.uploadFiles(this.selectedFiles);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private uploadFiles(files: UploadFile[]): void {
    this.bytesUploaded = [];
    this.filesUploading = true;

    forkJoin(
      files.map((file: UploadFile) => {
        this.bytesTotal += file.size;
        this.bytesUploaded.push(0);
        return this.getPresignedUrl(file).pipe(
          take(1),
          map(signedUrl => {
            return { file, signedUrl };
          })
        );
      })
    ).subscribe(signedUrls => {
      this.uploadSubscription$ = combineLatest(
        signedUrls.map(data => this.bulkUploadService.uploadFile(data.file, data.signedUrl))
      )
        .pipe(
          tap(events => {
            events.map((event, index: number) => {
              switch (event.type) {
                case HttpEventType.UploadProgress:
                  this.bytesUploaded[index] = event.loaded;
                  break;
              }
            });
          })
        )
        .subscribe(
          null,
          () => this.cancelUpload(),
          () => {
            this.bulkUploadService.uploadedFiles$.next(this.selectedFiles);
            this.filesUploading = false;
            this.filesUploaded = true;
          }
        );
    });
  }

  private getPresignedUrl(file: UploadFile): Observable<string> {
    return this.bulkUploadService.getPresignedUrl(file.name);
  }

  public removeFiles(): void {
    this.fileUpload.setValidators(Validators.required);
    this.form.reset();
    this.submitted = false;
    this.selectedFiles = [];
    this.bulkUploadService.selectedFiles$.next(this.selectedFiles);

    if (this.submitted) {
      this.bulkUploadService.exposeForm$.next(this.form);
    }
  }

  public cancelUpload(): void {
    this.filesUploading = false;
    this.uploadSubscription$.unsubscribe();
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.bulkUploadService.formErrorsMap());
  }
}
