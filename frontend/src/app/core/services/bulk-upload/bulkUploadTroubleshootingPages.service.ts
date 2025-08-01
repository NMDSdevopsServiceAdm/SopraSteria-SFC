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
    const params = new HttpParams().set('fields', 'title,content').set('env', environment.environmentName);

    return this.http.get<BulkUploadTroubleshootingPages>(
      `${environment.appRunnerEndpoint}/api/cms/items/${this.path}`,
      { params },
    );
  }
}
