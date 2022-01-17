import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BulkUploadTopTips } from '@core/model/bulk-upload-top-tips.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadTopTipsService {
  private path = 'bulk_upload_top_tips';
  private returnTo$ = new BehaviorSubject<URLStructure>(null);

  constructor(private http: HttpClient) {}

  public get returnTo(): URLStructure {
    return this.returnTo$.value;
  }

  public setReturnTo(returnTo: URLStructure) {
    this.returnTo$.next(returnTo);
  }

  public getTopTipsTitles(): Observable<BulkUploadTopTips> {
    let params = new HttpParams();

    params = params.set('fields', 'title,slug,link_title');

    return this.http.get<BulkUploadTopTips>(`${environment.cmsUri}/items/${this.path}`, { params });
  }

  public getTopTip(topTipSlug: string): Observable<BulkUploadTopTips> {
    let params = new HttpParams();

    const slugFilter = {
      slug: { _eq: topTipSlug },
    };

    params = params.set('filter', JSON.stringify(slugFilter));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title,slug');

    return this.http.get<BulkUploadTopTips>(`${environment.cmsUri}/items/${this.path}`, { params });
  }
}
