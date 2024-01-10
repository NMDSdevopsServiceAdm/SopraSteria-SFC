import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Article } from '@core/model/article.model';
import { ArticlesService } from '@core/services/articles.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class ArticleResolver implements Resolve<any> {
  constructor(private router: Router, private articlesService: ArticlesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | Article[]> {
    const articleSlug = route.paramMap.get('slug');
    if (articleSlug) {
      return this.articlesService.getArticle(articleSlug).pipe(
        take(1),
        catchError(() => {
          return of(null);
        }),
      );
    }
  }
}
