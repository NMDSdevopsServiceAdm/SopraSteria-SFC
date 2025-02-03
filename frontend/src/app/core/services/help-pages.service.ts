import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelpPages } from '@core/model/help-pages.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HelpPagesService {
  private path: string = 'Help_pages';

  constructor(private http: HttpClient) {}

  public getHelpPage(slug: string): Observable<HelpPages> {
    let params = new HttpParams();

    const filter = {
      slug: { _eq: slug },
      Status: { _eq: 'published' },
    };

    params = params.set('filter', JSON.stringify(filter));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title,Status');

    return this.http.get<HelpPages>(`${environment.cmsUri}/items/${this.path}`, { params });
  }
}
