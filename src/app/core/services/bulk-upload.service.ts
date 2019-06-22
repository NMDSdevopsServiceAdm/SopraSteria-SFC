import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  PresignedUrlResponseItem,
  PresignedUrlsRequest,
  ValidatedFile,
  ValidatedFilesResponse,
} from '@core/model/bulk-upload.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadService {
  public exposeForm$: BehaviorSubject<FormGroup> = new BehaviorSubject(null);
  public preValidationError$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public selectedFiles$: BehaviorSubject<File[]> = new BehaviorSubject(null);
  public serverError$: BehaviorSubject<string> = new BehaviorSubject(null);
  public uploadComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public validationErrors$: BehaviorSubject<Array<ErrorDefinition>> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  public getPresignedUrls(payload: PresignedUrlsRequest): Observable<PresignedUrlResponseItem[]> {
    return this.http.post<PresignedUrlResponseItem[]>(
      `/api/establishment/${this.establishmentService.establishmentId}/bulkupload/uploaded`,
      payload
    );
  }

  public uploadFile(file: File, signedURL: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': file.type });
    return this.http.put(signedURL, file, { headers, reportProgress: true, observe: 'events' });
  }

  public getFileType(fileName: string): string {
    const parts: Array<string> = fileName.split('.');
    return parts[parts.length - 1].toUpperCase();
  }

  public preValidateFiles(establishmentId: number): Observable<ValidatedFile[]> {
    return this.http.put<ValidatedFile[]>(`/api/establishment/${establishmentId}/bulkupload/uploaded`, null);
  }

  public validateFiles(establishmentId: number): Observable<ValidatedFilesResponse> {
    return this.http.put<ValidatedFilesResponse>(`/api/establishment/${establishmentId}/bulkupload/validate`, null);
  }

  public getReport(establishmentId: number): Observable<Blob> {
    const httpOptions: Object = {
      responseType: 'blob',
    };
    return this.http.get<Blob>(`/api/establishment/${establishmentId}/bulkupload/report`, httpOptions);
  }

  public complete(establishmentId: number) {
    return this.http.post(`/api/establishment/${establishmentId}/bulkupload/complete`, null);
  }

  public formErrorsMap(): Array<ErrorDetails> {
    return [
      {
        item: 'fileUpload',
        type: [
          {
            name: 'required',
            message: 'No files selected',
          },
          {
            name: 'filecount',
            message: 'Please select between 2 and 3 files.',
          },
          {
            name: 'filesize',
            message: 'The selected files must be smaller than 20MB.',
          },
          {
            name: 'filetype',
            message: 'The selected files must be a CSV or ZIP.',
          },
          {
            name: 'prevalidation',
            message: 'Please ensure both workplace and staff files are uploaded.',
          },
        ],
      },
    ];
  }

  public serverErrorsMap(): Array<ErrorDefinition> {
    return [
      {
        name: 400,
        message: 'Validation failed.',
      },
      {
        name: 503,
        message: 'There is a problem with the service.',
      },
    ];
  }
}
