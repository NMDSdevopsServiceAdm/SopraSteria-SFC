import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyRoute } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';
//import EstablishmentService from core
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: JourneyRoute[];

  //remove override message.
  //public overrideMessage: string;
  //insert workplaceName: string;
  private workplaceName:string;
  private subscriptions: Subscription = new Subscription();

  // insert private establishmentService: EstablishmentService
  constructor(private breadcrumbService: BreadcrumbService, private router: Router, private tabsService: TabsService, establishmentService: EstablishmentService,) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.breadcrumbService.routes$.subscribe((routes) => {
        this.breadcrumbs = routes ? this.getBreadcrumbs(routes) : null;
      }),
    );
    // delete
   // this.subscriptions.add(
    //  this.breadcrumbService.overrideMessage$.subscribe(overrideMessage => this.overrideMessage = overrideMessage ? overrideMessage : undefined)
   // );
    //insert this.establismentService.esblishment.name subcriptions.add
    this.subscriptions.add(
      this.workplaceName = this.establismentService.esblishment.name;
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
