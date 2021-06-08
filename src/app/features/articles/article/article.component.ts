import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '@core/model/article.model';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  providers: [],
})
export class ArticleComponent {
  constructor(private route: ActivatedRoute) {}

  public article: Article = this.route.snapshot.data.article.data.articles[0];
}
