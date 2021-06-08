import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Article } from '@core/model/article.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  providers: [],
})
export class ArticleComponent implements OnInit {
  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  public article: Article = this.route.snapshot.data.article.data.articles[0];

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.PUBLIC);
  }
}
