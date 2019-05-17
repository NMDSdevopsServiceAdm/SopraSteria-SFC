import { BehaviorSubject, Observable } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PresignedUrlResponse } from '@core/model/bulk-upload.model';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadService {
  public selectedFiles$: BehaviorSubject<Array<File>> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  public getPresignedUrl(filename: string): Observable<PresignedUrlResponse> {
    const params = new HttpParams().set('filename', filename);

    return this.http.get<PresignedUrlResponse>(
      `/api/establishment/${this.establishmentService.establishmentId}/bulkupload/signedUrl`,
      {
        params,
      }
    );
  }
}
