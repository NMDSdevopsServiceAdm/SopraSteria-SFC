import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadTopTipsService {
  private path = 'bulkuploadtoptips';

  constructor(private http: HttpClient) {}

  public getTopTipsTitles(): Observable<any> {
    let params = new HttpParams();
    const slugFilter = {
      slug: { _eq: 'add-unique-references' },
    };
    params = params.set('filter', JSON.stringify(slugFilter));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title');

    return this.http.get<any>(`${environment.cmsUri}/items/${this.path}`, { params });
  }
}
