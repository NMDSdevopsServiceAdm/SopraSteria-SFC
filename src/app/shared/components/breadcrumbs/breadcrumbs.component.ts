import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyRoute } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: JourneyRoute[];
  private subscriptions: Subscription = new Subscription();

  constructor(private breadcrumbService: BreadcrumbService, private router: Router, private tabsService: TabsService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.breadcrumbService.routes$.subscribe((routes) => {
        this.breadcrumbs = routes ? this.getBreadcrumbs(routes) : null;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getBreadcrumbs(routes: JourneyRoute[]) {
    const routesWithReferrers = routes.filter((route) => route.referrer);

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

  public selectTab(event: Event, route: { path: string; fragment: string }): void {
    event.preventDefault();
    if (route.path === '/dashboard' && !route.fragment) {
      this.tabsService.selectedTab = 'home';
    }
  }
}
