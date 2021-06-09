import { Component, OnInit } from '@angular/core';
import { Article } from '@core/model/article.model';
import { ArticlesService } from '@core/services/articles.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  providers: [],
})
export class ArticleListComponent implements OnInit {
  public articles: Article[];
  private subscriptions: Subscription = new Subscription();

  constructor(private articlesService: ArticlesService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.articlesService.getThreeLatestArticles().subscribe((articles: Article[]) => {
        this.articles = articles;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
