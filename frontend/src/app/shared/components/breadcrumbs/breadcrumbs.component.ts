import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyRoute } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: JourneyRoute[];
  public overrideMessage: string;
  private subscriptions: Subscription = new Subscription();
  private workplace: Establishment;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((workplace) => {
        this.workplace = workplace;
      }),
    );

    this.subscriptions.add(
      this.breadcrumbService.routes$.subscribe((routes) => {
        this.breadcrumbs = routes ? this.getBreadcrumbs(routes) : null;
      }),
    );
    this.subscriptions.add(
      this.breadcrumbService.overrideMessage$.subscribe(
        (overrideMessage) => (this.overrideMessage = overrideMessage ? overrideMessage : undefined),
      ),
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
        fragment: 'home',
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
    if (route.path === '/dashboard' && route.fragment === 'home') {
      this.tabsService.selectedTab = 'home';
    }
  }
}
