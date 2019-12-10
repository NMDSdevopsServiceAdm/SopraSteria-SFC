import { HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  PresignedUrlResponseItem,
  PresignedUrlsRequest,
  UploadFileRequestItem,
  ValidatedFile,
} from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { filter } from 'lodash';
import { combineLatest, interval, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
})
export class FilesUploadComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
  public form: FormGroup;
  public filesUploading = false;
  public filesUploaded = false;
  public submitted = false;
  public selectedFiles: File[];
  public bulkUploadStatus: string;
  public status: Subscription;
  public stopPolling: boolean;
  private bytesTotal = 0;
  private bytesUploaded: number[] = [];
  private subscriptions: Subscription = new Subscription();
  private uploadSubscription$: Subscription;

  constructor(
    private bulkUploadService: BulkUploadService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setupForm();
    this.checkForUploadedFiles();
    this.status = interval(1000).subscribe(() => {
      console.log(this.stopPolling);
      if (!this.stopPolling) {
        this.checkForUploadedFiles();
      }
    });
  }

  ngOnDestroy() {
    this.status.unsubscribe();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
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

  private checkForUploadedFiles(): void {
    this.subscriptions.add(
      this.bulkUploadService
        .getUploadedFiles(this.establishmentService.primaryWorkplace.uid)
        .subscribe((response: ValidatedFile[]) => {
          if (response.length) {
            this.filesUploaded = true;
            this.bulkUploadService.uploadedFiles$.next(response);
          }
          this.checkForPreValidationError();
        })
    );
  }

  private checkForPreValidationError(): void {
    this.subscriptions.add(
      this.bulkUploadService.preValidationError$.subscribe((preValidationError: boolean) => {
        if (preValidationError) {
          this.fileUpload.setErrors({ prevalidation: preValidationError === true ? true : null });
          this.bulkUploadService.exposeForm$.next(this.form);
        }
      })
    );
  }

  get fileUpload(): AbstractControl {
    return this.form.get('fileUpload');
  }

  public onFilesSelection($event: Event): void {
    this.stopPolling = true;
    this.bulkUploadService.resetBulkUpload();
    const target = $event.target || $event.srcElement;
    this.selectedFiles = Array.from(target[`files`]);
    this.fileUpload.setValidators(CustomValidators.checkFiles);
    this.fileUpload.updateValueAndValidity();
    this.bulkUploadService.selectedFiles$.next(this.selectedFiles);
    this.filesUploaded = false;

    if (this.submitted) {
      this.bulkUploadService.exposeForm$.next(this.form);
    }
  }

  private getPresignedUrlsRequest(): PresignedUrlsRequest {
    const request: PresignedUrlsRequest = { files: [] };
    this.selectedFiles.forEach((file: File) => {
      request.files.push({ filename: file.name });
    });

    return request;
  }

  private getPresignedUrls(): void {
    this.subscriptions.add(
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
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private prepForUpload(response: PresignedUrlResponseItem[]): void {
    this.bytesUploaded = [];
    const request: UploadFileRequestItem[] = [];
    this.selectedFiles.forEach((file: File) => {
      this.bytesTotal += file.size;
      this.bytesUploaded.push(0);

      const filteredItem = filter(response, ['filename', file.name])[0];
      request.push({
        file,
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
          this.resetFileInputElement();
          this.bulkUploadService.preValidateFiles$.next(true);
          this.filesUploading = false;
          this.filesUploaded = true;
          this.stopPolling = false;
        }
      );
  }

  private resetFileInputElement(): void {
    this.renderer.selectRootElement('#fileUpload').value = '';
  }

  public removeFiles(): void {
    this.resetFileInputElement();
    this.fileUpload.setValidators(Validators.required);
    this.form.reset();
    this.submitted = false;
    this.selectedFiles = [];
    this.bulkUploadService.selectedFiles$.next(null);

    if (this.submitted) {
      this.bulkUploadService.exposeForm$.next(this.form);
    }
  }

  public cancelUpload(): void {
    this.filesUploading = false;
    this.subscriptions.unsubscribe();
    this.uploadSubscription$.unsubscribe();
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.bulkUploadService.formErrorsMap());
  }
}
