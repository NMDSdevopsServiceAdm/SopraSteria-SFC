import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Articles } from '@core/model/article.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  private path: string = 'articles';

  constructor(private http: HttpClient) {}

  public getArticle(articleSlug: string): Observable<Articles> {
    let params = new HttpParams();
    const slugFilter = {
      slug: { _eq: articleSlug },
    };
    params = params.set('filter', JSON.stringify(slugFilter));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title,slug');

    return this.http.get<Articles>(`${environment.cmsUri}/items/${this.path}`, { params });
  }

  public getThreeLatestArticles(): Observable<Articles> {
    let params = new HttpParams();

    const statusFilter = {
      status: { _eq: 'published' },
    };
    params = params.set('sort', '-publish_date');
    params = params.set('limit', '3');
    params = params.set('fields', 'title,slug');
    params = params.set('filter', JSON.stringify(statusFilter));

    return this.http.get<Articles>(`${environment.cmsUri}/items/${this.path}`, { params });
  }
}
