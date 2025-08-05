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

  public getPage(slug: string): Observable<Pages> {
    const filter = {
      slug: { _eq: slug },
      status: { _eq: 'published' },
    };

    const params = new HttpParams()
      .set('filter', JSON.stringify(filter))
      .set('limit', '1')
      .set('fields', 'content,title,status')
      .set('env', environment.environmentName);

    return this.http.get<Pages>(`${environment.appRunnerEndpoint}/api/cms/items/${this.path}`, { params });
  }
}
