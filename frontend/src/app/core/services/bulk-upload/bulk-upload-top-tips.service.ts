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
    const params = new HttpParams().set('fields', 'title,slug,link_title').set('env', environment.environmentName);

    return this.http.get<BulkUploadTopTips>(`${environment.appRunnerEndpoint}/api/cms/items/${this.path}`, { params });
  }

  public getTopTip(topTipSlug: string): Observable<BulkUploadTopTips> {
    const slugFilter = {
      slug: { _eq: topTipSlug },
    };

    const params = new HttpParams()
      .set('filter', JSON.stringify(slugFilter))
      .set('limit', '1')
      .set('fields', 'content,title,slug')
      .set('env', environment.environmentName);

    return this.http.get<BulkUploadTopTips>(`${environment.appRunnerEndpoint}/api/cms/items/${this.path}`, { params });
  }
}
