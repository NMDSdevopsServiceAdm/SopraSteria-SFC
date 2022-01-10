import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BulkUploadTopTips } from '@core/model/bulk-upload-top-tips.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadTopTipsService {
  private path = 'bulkuploadtoptips';

  constructor(private http: HttpClient) {}

  public getTopTipsTitles(): Observable<BulkUploadTopTips> {
    let params = new HttpParams();

    // params = params.set('filter', JSON.stringify(slugFilter));
    // params = params.set('limit', '1');
    params = params.set('fields', 'title,slug');

    return this.http.get<BulkUploadTopTips>(`${environment.cmsUri}/items/${this.path}`, { params });
  }

  public getTopTip(topTipSlug: string): Observable<BulkUploadTopTips> {
    let params = new HttpParams();

    const slugFilter = {
      slug: { _eq: 'add-unique-references' },
    };

    params = params.set('filter', JSON.stringify(slugFilter));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title,slug');

    return this.http.get<BulkUploadTopTips>(`${environment.cmsUri}/items/${this.path}`, { params });
  }
}
