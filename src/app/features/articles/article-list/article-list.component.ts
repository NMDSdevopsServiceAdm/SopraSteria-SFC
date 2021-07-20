import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '@core/model/article.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  providers: [],
})
export class ArticleListComponent implements OnInit, OnDestroy {
  public articleList: Article[];
  public currentArticleSlug: string;
  public subscriptions = new Subscription();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subscribeToUrlToUpdateArticleListAndCurrentSlug();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  subscribeToUrlToUpdateArticleListAndCurrentSlug(): void {
    this.subscriptions.add(
      this.route.url.subscribe(() => {
        if (this.route.snapshot.data.articleList) {
          this.articleList = this.route.snapshot.data.articleList.data;
        }
        if (this.route.snapshot.data.articles) {
          this.currentArticleSlug = this.route.snapshot.data.articles.data[0].slug;
        }
      }),
    );
  }
}
