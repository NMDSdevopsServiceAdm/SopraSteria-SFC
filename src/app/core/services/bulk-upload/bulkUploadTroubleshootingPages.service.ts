import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BulkUploadTroubleshootingPages } from '@core/model/bulk-upload-troubleshooting-page.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadTroubleshootingPagesService {
  private path = 'troubleshooting';

  constructor(private http: HttpClient) {}

  public getBulkUploadTroubleshootingPage(): Observable<BulkUploadTroubleshootingPages> {
    let params = new HttpParams();
    params = params.set('fields', 'title,content');

    return this.http.get<BulkUploadTroubleshootingPages>(`${environment.cmsUri}/items/${this.path}`, { params });
  }
}
