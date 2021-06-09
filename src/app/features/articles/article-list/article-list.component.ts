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

  public articles: Article[] = this.route.snapshot.data.articleList;
}
