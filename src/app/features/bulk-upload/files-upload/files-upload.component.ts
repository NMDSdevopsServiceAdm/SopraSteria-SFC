import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  PresignedUrlResponseItem,
  PresignedUrlsRequest,
  UploadFile,
  UploadFileRequestItem,
} from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { combineLatest, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { filter } from 'lodash';

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
  private presignedUrlsSubcription$: Subscription = new Subscription();
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

  private getPresignedUrlsRequest(): PresignedUrlsRequest {
    const request: PresignedUrlsRequest = { files: [] };
    this.selectedFiles.forEach((file: UploadFile) => {
      request.files.push({ filename: file.name });
    });

    return request;
  }

  private getPresignedUrls(): void {
    this.presignedUrlsSubcription$.add(
      this.bulkUploadService
        .getPresignedUrls(this.getPresignedUrlsRequest())
        .subscribe((response: PresignedUrlResponseItem[]) => this.prepForUpload(response))
    );
  }

  public onSubmit(): void {
    this.submitted = true;
    this.bulkUploadService.exposeForm$.next(this.form);

    if (this.form.valid) {
      this.getPresignedUrls();
      // this.uploadFiles(this.selectedFiles);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private prepForUpload(response: PresignedUrlResponseItem[]): void {
    this.bytesUploaded = [];
    const request: UploadFileRequestItem[] = [];

    this.selectedFiles.forEach((file: UploadFile) => {
      this.bytesTotal += file.size;
      this.bytesUploaded.push(0);

      const filteredItem = filter(response, ['filename', file.name])[0];
      request.push({
        file: file,
        signedUrl: filteredItem.signedUrl,
      });
    });

    this.uploadFiles(request);
  }

  private uploadFiles(request: UploadFileRequestItem[]): void {
    this.filesUploading = true;

    this.uploadSubscription$ = combineLatest(
      request.map(data => this.bulkUploadService.uploadFile(data.file, data.signedUrl))
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
    this.presignedUrlsSubcription$.unsubscribe();
    this.uploadSubscription$.unsubscribe();
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.bulkUploadService.formErrorsMap());
  }
}
