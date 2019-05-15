import { BehaviorSubject, Observable } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadService {
  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  public selectedFiles$: BehaviorSubject<Array<File>> = new BehaviorSubject(null);

  public getPresignedUrl(filename: string): Observable<any> {
    const params = new HttpParams().set('filename', filename);
    const headers = new HttpHeaders().set('Content-Type', 'binary/octet-stream');

    return this.http.get<any>(
      `/api/establishment/${this.establishmentService.establishmentId}/bulkupload/signedUrl`,
      { headers, params }
    );
  }
}
