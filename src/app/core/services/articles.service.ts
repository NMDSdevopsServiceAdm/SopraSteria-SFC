import { Injectable } from '@angular/core';
import { Article, Articles } from '@core/model/article.model';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor(private apollo: Apollo) {}

  public getArticle(articleSlug: string): Observable<Article[]> {
    const articleQuery = {
      query: gql`
          query GetArticle {
            articles(limit: 1, filter: {
              slug: {
                _eq: "${articleSlug}"
              }
            }) {
              content
              title
            }
          }
        `,
    };
    return this.apolloGet(articleQuery);
  }

  public getThreeLatestArticles(): Observable<Article[]> {
    const articleQuery = {
      query: gql`
        query GetArticle {
          articles(limit: 3, sort: ["-publish_date"]) {
            slug
            title
          }
        }
      `,
    };
    return this.apolloGet(articleQuery);
  }

  private apolloGet(query: any): Observable<Article[]> {
    return this.apollo.watchQuery<Articles>(query).valueChanges.pipe(map((response: any) => response.data.articles));
  }
}
