import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Article } from '@core/model/article.model';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor(private apollo: Apollo) {}

  public getArticle(articleSlug: string): Observable<ApolloQueryResult<Article>> {
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

  private apolloGet(query: any): Observable<ApolloQueryResult<Article>> {
    return this.apollo.watchQuery<Article>(query).valueChanges.pipe(map((data: ApolloQueryResult<Article>) => data));
  }
}
