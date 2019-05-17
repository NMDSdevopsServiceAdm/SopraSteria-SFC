import { BehaviorSubject, Observable } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PresignedUrlResponse } from '@core/model/bulk-upload.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadService {
  public selectedFiles$: BehaviorSubject<Array<File>> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  public getPresignedUrl(filename: string): Observable<string> {
    const params = new HttpParams().set('filename', filename);

    return this.http.get<PresignedUrlResponse>(
      `/api/establishment/${this.establishmentService.establishmentId}/bulkupload/signedUrl`,
      {
        params,
      }
    ).pipe(map((data: PresignedUrlResponse) => data.urls));
  }

  public uploadFile(file: File, signedURL: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': file.type });
    return this.http.put(signedURL, file, { headers, reportProgress: true });
  }
}
