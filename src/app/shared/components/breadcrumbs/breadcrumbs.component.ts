import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { NestedRoutesService } from '@core/services/nested-routes.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: any[] = [];
  public display = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private breadcrumbService: BreadcrumbService, private nestedRoutesService: NestedRoutesService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.nestedRoutesService.routes$.subscribe(routes => {
        this.breadcrumbs = routes;
      })
    );

    this.subscriptions.add(
      this.breadcrumbService.display$.subscribe(display => {
        this.display = display;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
