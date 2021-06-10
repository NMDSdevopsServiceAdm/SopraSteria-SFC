import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '@core/model/article.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  providers: [],
})
export class ArticleListComponent {
  public articleList: Article[];
  public currentArticleSlug: string;
  public subscriptions = new Subscription();

  constructor(private route: ActivatedRoute) {
    this.subscriptions.add(this.route.url.subscribe(() => this.updateArticleListAndCurrentArticleSlug()));
  }

  updateArticleListAndCurrentArticleSlug(): void {
    this.articleList = this.route.snapshot.data.articleList.data;
    this.currentArticleSlug = this.route.snapshot.data.articles.data[0].slug;
  }
}
