import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, PRIMARY_OUTLET, Router } from '@angular/router';
import { find } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface IRoute {
  title: string;
  params: Params;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class NestedRoutesService {
  private readonly _routes$: BehaviorSubject<IRoute[]> = new BehaviorSubject<IRoute[]>(null);
  public readonly routes$: Observable<IRoute[]> = this._routes$.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute)
      )
      .subscribe(route => {
        const routes = this.getNestedRoutes(route);
        this._routes$.next(routes);
      });
  }

  private getNestedRoutes(route: ActivatedRoute, url: string = '', routes: IRoute[] = []): IRoute[] {
    const nestedRouteProperty = 'title';
    const children = route.children;

    if (children.length === 0) {
      return routes;
    }

    for (const child of children) {
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      if (!child.snapshot.data.hasOwnProperty(nestedRouteProperty) || !child.snapshot.url.length) {
        return this.getNestedRoutes(child, url, routes);
      }

      const routeURL = child.snapshot.url.map(segment => segment.path).join('/');

      url += `/${routeURL}`;

      if (!find(routes, ['label', child.snapshot.data[nestedRouteProperty]])) {
        routes.push({
          title: child.snapshot.data[nestedRouteProperty],
          params: child.snapshot.params,
          url,
        });
      }

      return this.getNestedRoutes(child, url, routes);
    }
  }
}
