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
    const slugFilter = {
      slug: { _eq: articleSlug },
    };

    const params = new HttpParams()
      .set('filter', JSON.stringify(slugFilter))
      .set('limit', '1')
      .set('fields', 'content,title,slug')
      .set('env', environment.environmentName);

    return this.http.get<Articles>(`${environment.appRunnerEndpoint}/api/cms/items/${this.path}`, { params });
  }

  public getThreeLatestArticles(): Observable<Articles> {
    const statusFilter = {
      status: { _eq: 'published' },
    };

    const params = new HttpParams()
      .set('sort', '-publish_date')
      .set('limit', '3')
      .set('fields', 'title,slug')
      .set('filter', JSON.stringify(statusFilter))
      .set('env', environment.environmentName);

    return this.http.get<Articles>(`${environment.appRunnerEndpoint}/api/cms/items/${this.path}`, { params });
  }
}
