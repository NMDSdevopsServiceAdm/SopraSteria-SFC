import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '@core/model/article.model';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  providers: [],
})
export class ArticleListComponent {
  constructor(private route: ActivatedRoute) {}

  public articleList: Article[] = this.route.snapshot.data.articleList;
  public currentArticleSlug: string = this.route.snapshot.data.articles[0].slug;
}
