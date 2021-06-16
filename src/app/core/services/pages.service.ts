import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pages } from '@core/model/page.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PagesService {
  private path = 'pages';

  constructor(private http: HttpClient) {}

  public getPage(pageId: string): Observable<Pages> {
    let params = new HttpParams();
    const pageIdFilter = {
      slug: { _eq: pageId },
    };
    params = params.set('filter', JSON.stringify(pageIdFilter));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title');

    return this.http.get<Pages>(`${environment.cmsUri}${this.path}`, { params });
  }
}
