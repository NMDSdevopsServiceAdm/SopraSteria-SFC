import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PresignedUrlResponse, UploadFile, ValidatedFilesResponse } from '@core/model/bulk-upload.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadService {
  public exposeForm$: BehaviorSubject<FormGroup> = new BehaviorSubject(null);
  public selectedFiles$: BehaviorSubject<Array<UploadFile>> = new BehaviorSubject(null);
  public uploadedFiles$: BehaviorSubject<Array<UploadFile>> = new BehaviorSubject(null);
  public totalErrors$: BehaviorSubject<number> = new BehaviorSubject(0);

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
    return this.http.put(signedURL, file, { headers, reportProgress: true, observe: 'events' });
  }

  public getFileType(fileName: string): string {
    const parts: Array<string> = fileName.split('.');
    return parts[parts.length - 1].toUpperCase();
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
