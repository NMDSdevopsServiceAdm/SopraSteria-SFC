import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PresignedUrlResponse, UploadFile, ValidatedFilesResponse } from '@core/model/bulk-upload.model';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadService {
  public exposeForm$: BehaviorSubject<FormGroup> = new BehaviorSubject(null);
  public selectedFiles$: BehaviorSubject<Array<UploadFile>> = new BehaviorSubject(null);
  public uploadedFiles$: BehaviorSubject<Array<UploadFile>> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  public getPresignedUrl(filename: string): Observable<string> {
    const params = new HttpParams().set('filename', filename);

    return this.http
      .get<PresignedUrlResponse>(
        `/api/establishment/${this.establishmentService.establishmentId}/bulkupload/signedUrl`,
        {
          params,
        }
      )
      .pipe(map((data: PresignedUrlResponse) => data.urls));
  }

  public uploadFile(file: UploadFile, signedURL: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': file.type });
    return this.http.put(signedURL, file, { headers, reportProgress: true });
  }

  public getFileType(fileName: string): string {
    const parts: Array<string> = fileName.split('.');
    return parts[parts.length - 1].toUpperCase();
  }

  public validateFiles(): Observable<ValidatedFilesResponse> {
    // TODO mock api - swap out with below once BE is ready
    const errorMock = `http://www.mocky.io/v2/5cfb65d33000007f100a8b3d?mocky-delay=2000ms`;
    const successMock = `http://www.mocky.io/v2/5cf66a70320000cf8c8cd282?mocky-delay=2000ms`;

    return this.http.put<ValidatedFilesResponse>(errorMock, null);
    // return this.http.put<ValidatedFilesResponse>(
    //   `/api/establishment/${this.establishmentService.establishmentId}/bulkupload/validate`,
    //   null
    // );
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
            message: 'Please select a total of 3 files.',
          },
          {
            name: 'filesize',
            message: 'The selected files must be smaller than 20MB.',
          },
          {
            name: 'filetype',
            message: 'The selected files must be a CSV or ZIP.',
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
