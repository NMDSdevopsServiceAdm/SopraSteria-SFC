import { Injectable } from '@angular/core';
import { Article } from '@core/model/article.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor() {}

  public getArticle(articleSlug: string): Observable<Article[]> {
    const articleQuery = 'a';
    // const articleQuery = {
    //   query: gql`
    //       query GetArticle {
    //         articles(limit: 1, filter: {
    //           slug: {
    //             _eq: "${articleSlug}"
    //           }
    //         }) {
    //           content
    //           title
    //           slug
    //         }
    //       }
    //     `,
    // };
    return this.apolloGet(articleQuery);
  }

  public getThreeLatestArticles(): Observable<Article[]> {
    const articleQuery = 'a';
    // const articleQuery = {
    //   query: gql`
    //     query GetArticle {
    //       articles(limit: 3, sort: ["-publish_date"]) {
    //         slug
    //         title
    //       }
    //     }
    //   `,
    // };
    return this.apolloGet(articleQuery);
  }

  private apolloGet(query: any): Observable<Article[]> {
    return of([]);
    //return this.apollo.watchQuery<Articles>(query).valueChanges.pipe(map((response: any) => response.data.articles));
  }
}
