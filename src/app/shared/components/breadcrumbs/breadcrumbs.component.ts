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

  ngOnInit(): void {
    this.subscriptions.add(
      this.breadcrumbService.routes$.subscribe((routes) => {
        console.log('*** breadcrumbs ***');
        console.log(routes);
        this.breadcrumbs = routes ? this.getBreadcrumbs(routes) : null;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getBreadcrumbs(routes: JourneyRoute[]) {
    console.log('**** get breadcrumbs ****');
    const routesWithReferrers = routes.filter((route) => route.referrer);
    console.log(routes);
    routes = [
      {
        title: 'Home',
        path: '/dashboard',
      },
      ...routes,
    ];

    routesWithReferrers.forEach((referrerRoute) => {
      routes = routes.map((route) => {
        if (route.path === referrerRoute.referrer.path) {
          return {
            ...route,
            fragment: referrerRoute.referrer.fragment,
          };
        }
        return route;
      });
    });

    return routes;
  }
}
