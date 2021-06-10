import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Article } from '@core/model/article.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  providers: [],
})
export class ArticleComponent implements OnInit, OnDestroy {
  public subscriptions = new Subscription();
  public article: Article = this.route.snapshot.data.articles.data[0];

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit() {
    this.subscriptions.add(this.route.url.subscribe(() => this.updateArticleAndBreadcrumbs()));
  }

  updateArticleAndBreadcrumbs() {
    this.article = this.route.snapshot.data.articles[0];
    this.breadcrumbService.show(JourneyType.PUBLIC);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
