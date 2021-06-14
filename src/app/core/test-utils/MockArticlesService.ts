import { Injectable } from '@angular/core';
import { Articles } from '@core/model/article.model';
import { ArticlesService } from '@core/services/articles.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockArticlesService extends ArticlesService {
  public getArticle(articleSlug: string): Observable<Articles> {
    return of({
      data: [
        {
          title: 'test',
          content: 'Testing',
          id: 1,
          date_created: new Date(),
          date_updated: new Date(),
          user_created: 'duhefwiuh',
          user_updated: 'fhewoihf',
        },
      ],
    } as Articles);
  }
}
