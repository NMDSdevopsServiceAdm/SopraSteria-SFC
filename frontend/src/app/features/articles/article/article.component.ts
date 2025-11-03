import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Article } from '@core/model/article.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-article',
    templateUrl: './article.component.html',
    providers: [],
    standalone: false
})
export class ArticleComponent implements OnInit, OnDestroy {
  public subscriptions = new Subscription();
  public article: Article;
  public workplace: Establishment;

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService, private router: Router,  private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.PAGES_ARTICLES);
    this.workplace = this.establishmentService.establishment;
    this.setArticle();
    this.addSubscriptionToUpdateBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setArticle(): void {
    this.subscriptions.add(
      this.route.url.subscribe(() => {
        this.article = this.route.snapshot.data.articles?.data[0];
      }),
    );
  }

  addSubscriptionToUpdateBreadcrumbs(): void {
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          map(() => this.route),
        )
        .subscribe((data) => {
          this.breadcrumbService.show(JourneyType.PAGES_ARTICLES);
        }),
    );
  }
}
