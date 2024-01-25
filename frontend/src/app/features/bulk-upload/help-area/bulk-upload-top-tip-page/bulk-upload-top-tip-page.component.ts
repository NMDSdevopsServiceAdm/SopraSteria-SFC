import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BulkUploadTopTip } from '@core/model/bulk-upload-top-tips.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-bulk-upload-top-tip-page',
  templateUrl: './bulk-upload-top-tip-page.component.html',
})
export class BulkUploadTopTipPageComponent implements OnInit, OnDestroy {
  public topTipsList: BulkUploadTopTip[];
  public topTip: BulkUploadTopTip;
  public subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private bulkUploadTopTipsService: BulkUploadTopTipsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD_HELP);
    this.subscribeToUrltoUpdateHowToListAndCurrentSlug();
    this.addSubscriptionToUpdateBreadcrumbs();
  }

  setReturnUrl(slug: string): void {
    this.bulkUploadTopTipsService.setReturnTo({ url: ['/bulk-upload', 'get-help', slug] });
  }

  subscribeToUrltoUpdateHowToListAndCurrentSlug(): void {
    this.subscriptions.add(
      this.route.url.subscribe(() => {
        if (this.route.snapshot.data.topTipsList) {
          this.topTipsList = this.route.snapshot.data.topTipsList.data;
        }
        if (this.route.snapshot.data.topTip) {
          this.topTip = this.route.snapshot.data.topTip.data[0];
        }
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
        .subscribe(() => {
          this.breadcrumbService.show(JourneyType.BULK_UPLOAD_HELP);
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
