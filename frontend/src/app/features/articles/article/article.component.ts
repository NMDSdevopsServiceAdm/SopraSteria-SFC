import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Article } from '@core/model/article.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  providers: [],
})
export class ArticleComponent implements OnInit, OnDestroy {
  public subscriptions = new Subscription();
  public article: Article;
  public workplaceID: string;
  public isParentSubsidiaryView: boolean;
  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    public parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.PAGES_ARTICLES);
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();
    this.parentSubsidiaryViewService.getObservableSubsidiaryUid().subscribe((subsidiaryUid) => {
      this.workplaceID = subsidiaryUid;
    });
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

  public returnToHome(): Promise<boolean> {
    if (this.isParentSubsidiaryView) {
      return this.router.navigate(['subsidiary/home', this.workplaceID]);
    }
    return this.router.navigate(['/dashboard']);
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
