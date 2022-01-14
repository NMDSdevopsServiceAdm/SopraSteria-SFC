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

  public getBulkUploadTroubleshootingPage(
    bulkUploadTroubleshootingPageSlug: string,
  ): Observable<BulkUploadTroubleshootingPages> {
    let params = new HttpParams();
    const slugFilter = {
      slug: { _eq: bulkUploadTroubleshootingPageSlug },
    };
    params = params.set('filter', JSON.stringify(slugFilter));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title');

    return this.http.get<BulkUploadTroubleshootingPages>(`${environment.cmsUri}/items/${this.path}`, { params });
  }
}
