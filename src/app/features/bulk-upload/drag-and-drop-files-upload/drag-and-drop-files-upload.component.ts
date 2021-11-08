import { HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import {
  PresignedUrlResponseItem,
  PresignedUrlsRequest,
  UploadFileRequestItem,
  ValidatedFile,
} from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import filter from 'lodash/filter';
import { combineLatest, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-drag-and-drop-files-upload',
  templateUrl: './drag-and-drop-files-upload.component.html',
  styleUrls: ['./drag-and-drop-files-upload.component.scss'],
})
export class DragAndDropFilesUploadComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public filesUploading = false;
  public submitted = false;
  public selectedFiles: File[];
  public bulkUploadStatus: string;
  public showInvalidFileError = false;
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
  ) {}

  ngOnInit() {
    this.setupForm();
    this.checkForUploadedFiles();
    this.subscriptions.add(
      this.bulkUploadService.showNonCsvError$.subscribe((showMessage: boolean) => {
        this.showInvalidFileError = showMessage;
      }),
    );
    this.bulkUploadService.showNonCsvErrorMessage(false);
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
      fileUpload: null,
    });
  }

  private checkForUploadedFiles(): void {
    this.subscriptions.add(
      this.bulkUploadService
        .getUploadedFiles(this.establishmentService.primaryWorkplace.uid)
        .subscribe((response: ValidatedFile[]) => {
          if (response.length) {
            this.bulkUploadService.uploadedFiles$.next(response);
          }
          this.checkForPreValidationError();
        }),
    );
  }

  private checkForPreValidationError(): void {
    this.subscriptions.add(
      this.bulkUploadService.preValidationError$.subscribe((preValidationError: boolean) => {
        if (preValidationError) {
          this.fileUpload.setErrors({ prevalidation: preValidationError === true ? true : null });
          this.bulkUploadService.exposeForm$.next(this.form);
        }
      }),
    );
  }

  get fileUpload(): AbstractControl {
    return this.form.get('fileUpload');
  }

  onSelect(event) {
    event.rejectedFiles.length > 0
      ? this.bulkUploadService.showNonCsvErrorMessage(true)
      : this.bulkUploadService.showNonCsvErrorMessage(false);

    this.selectedFiles = event.addedFiles;
    this.bulkUploadService.selectedFiles$.next(this.selectedFiles);
    this.getPresignedUrls();
  }

  onRemove(event) {
    this.selectedFiles.splice(this.selectedFiles.indexOf(event), 1);
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
      this.bulkUploadService.getPresignedUrls(this.getPresignedUrlsRequest()).subscribe(
        (response: PresignedUrlResponseItem[]) => this.prepForUpload(response),
        (error) => {
          //handle 500 with custom message to prevent service unavailable redirection
          if (error.status === 500) {
            const customeMessage = [
              {
                name: error.status,
                message: `Bulk upload is unable to continue processing your data due to an issue with your files.
                Please check and try again or contact Support on 0113 2410969.`,
              },
            ];
            this.bulkUploadService.serverError$.next(
              this.errorSummaryService.getServerErrorMessage(error.status, customeMessage),
            );
          } else {
            console.log(error);
          }
        },
      ),
    );
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
    this.stopPolling = false;

    this.uploadSubscription$ = combineLatest(
      request.map((data) => this.bulkUploadService.uploadFile(data.file, data.signedUrl)),
    )
      .pipe(
        tap((events) => {
          events.map((event, index: number) => {
            switch (event.type) {
              case HttpEventType.UploadProgress:
                this.bytesUploaded[index] = event.loaded;
                break;
            }
          });
        }),
      )
      .subscribe(
        null,
        () => this.cancelUpload(),
        () => {
          this.bulkUploadService.preValidateFiles$.next(true);
          this.filesUploading = false;
        },
      );
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
