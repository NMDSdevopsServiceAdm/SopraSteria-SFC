import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, PRIMARY_OUTLET, Router, UrlSegment } from '@angular/router';
import { JourneyRoute, JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { accountJourney } from '@core/breadcrumb/journey.accounts';
import { bulkUploadJourney } from '@core/breadcrumb/journey.bulk-upload';
import { publicJourney } from '@core/breadcrumb/journey.public';
import { reportJourney } from '@core/breadcrumb/journey.report';
import { allWorkplacesJourney, myWorkplaceJourney } from '@core/breadcrumb/journey.workplaces';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { parse } from 'url';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly _routes$: BehaviorSubject<Array<JourneyRoute>> = new BehaviorSubject<Array<JourneyRoute>>(null);
  public readonly routes$: Observable<Array<JourneyRoute>> = this._routes$.asObservable();

  constructor(private router: Router, private location: Location) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => parse(this.router.url).pathname),
        distinctUntilChanged(),
        map(() => this._routes$.value),
        filter(val => !!val)
      )
      .subscribe(() => {
        this._routes$.next(null);
      });
  }

  public show(journey: JourneyType) {
    const urlTree = this.router.parseUrl(this.location.path());
    const segmentGroup = urlTree.root.children[PRIMARY_OUTLET];
    const segments = segmentGroup ? segmentGroup.segments : null;
    const routes = this.getRoutes(this.getRoutesConfig(journey), segments);
    this._routes$.next(routes);
  }

  private getRoutes(currentRoute: JourneyRoute, segments: UrlSegment[], routes: JourneyRoute[] = []) {
    if (!currentRoute) {
      return routes;
    }

    const children = currentRoute.children;

    if (!children || children.length === 0) {
      return routes;
    }

    let hasMatched = false;

    children.forEach((child, index) => {
      if (hasMatched) {
        return routes;
      }

      const { title, path: url, referrer } = child;

      const isCurrentRoute = this.isCurrentRoute(url, segments);

      if (isCurrentRoute || index === children.length - 1) {
        routes.push({
          title,
          path: this.getPath(url, segments),
          ...(referrer && { referrer: this.getReferrer(referrer, segments) }),
        });
      }

      if (isCurrentRoute) {
        hasMatched = true;
        return routes;
      }

      return this.getRoutes(child, segments, routes);
    });

    return routes;
  }

  private getPath(url: string, segments: UrlSegment[]) {
    const path = this.getParts(url).map((part, index) => {
      if (this.isParameter(part)) {
        return segments[index] ? segments[index].path : part;
      }
      return part;
    });
    return '/' + path.join('/');
  }

  private getReferrer(referrer: JourneyRoute, segments: UrlSegment[]) {
    return {
      url: this.getPath(referrer.path, segments),
      fragment: referrer.fragment,
    };
  }

  private isCurrentRoute(url: string, segments: UrlSegment[]) {
    const parts = this.getParts(url);
    if (parts.length !== segments.length) {
      return false;
    }
    let matched = true;
    parts.forEach((part, index) => {
      const segment = segments[index];
      if (!this.isParameter(part) && part !== segment.path) {
        matched = false;
      }
    });
    return matched;
  }

  private getParts(url: string) {
    return url.split('/').filter(part => part !== '');
  }

  private isParameter(part: string) {
    return part.startsWith(':');
  }

  private getRoutesConfig(journey: JourneyType) {
    let routes: JourneyRoute;
    switch (journey) {
      case JourneyType.REPORTS: {
        routes = reportJourney;
        break;
      }
      case JourneyType.MY_WORKPLACE: {
        routes = myWorkplaceJourney;
        break;
      }
      case JourneyType.ALL_WORKPLACES: {
        routes = allWorkplacesJourney;
        break;
      }
      case JourneyType.PUBLIC: {
        routes = publicJourney;
        break;
      }
      case JourneyType.BULK_UPLOAD: {
        routes = bulkUploadJourney;
        break;
      }
      case JourneyType.ACCOUNT: {
        routes = accountJourney;
        break;
      }
      default: {
        routes = null;
      }
    }
    return routes;
  }
}
