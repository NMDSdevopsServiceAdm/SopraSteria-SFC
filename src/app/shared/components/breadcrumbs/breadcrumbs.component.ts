import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyRoute } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: JourneyRoute[];
  private subscriptions: Subscription = new Subscription();

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.breadcrumbService.routes$.subscribe(routes => {
        this.breadcrumbs = routes ? this.getBreadcrumbs(routes) : null;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private getBreadcrumbs(routes: JourneyRoute[]) {
    const currentPath = routes[routes.length - 1];

    routes = [
      {
        title: 'Home',
        path: '/dashboard',
      },
      ...routes,
    ];

    if (currentPath.referrer) {
      routes = routes.map(route => {
        if (route.path === currentPath.referrer.path) {
          return {
            ...route,
            fragment: currentPath.referrer.fragment,
          };
        }
        return route;
      });
    }
    return routes;
  }
}
