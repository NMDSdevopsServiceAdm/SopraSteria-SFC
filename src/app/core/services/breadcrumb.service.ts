import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, PRIMARY_OUTLET, Router, UrlSegment } from '@angular/router';
import { JourneyRoute, JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { accountJourney, editUserJourney } from '@core/breadcrumb/journey.accounts';
import {
  adminCqcStatusChangeJournery,
  adminJourney,
  adminPendingRegistrationJourney,
  adminRejectedRegistrationJourney,
} from '@core/breadcrumb/journey.admin';
import {
  benchmarksPayJourney,
  benchmarksQualificationsJourney,
  benchmarksSicknessJourney,
  benchmarksTurnoverJourney,
} from '@core/breadcrumb/journey.benchmark_metric';
import {
  benchmarksSubsidiariesPayJourney,
  benchmarksSubsidiariesQualificationsJourney,
  benchmarksSubsidiariesSicknessJourney,
  benchmarksSubsidiariesTurnoverJourney,
} from '@core/breadcrumb/journey.benchmark_subsidiaries';
import { benefitsBundleJourney } from '@core/breadcrumb/journey.benefits-bundle';
import { bulkUploadHelpJourney, bulkUploadJourney } from '@core/breadcrumb/journey.bulk-upload';
import { mandatoryTrainingJourney } from '@core/breadcrumb/journey.mandatory_training';
import { notificationsJourney } from '@core/breadcrumb/journey.notifications';
import { pagesArticlesJourney } from '@core/breadcrumb/journey.pages-articles';
import { publicJourney } from '@core/breadcrumb/journey.public';
import { wdfJourney, wdfParentJourney } from '@core/breadcrumb/journey.wdf';
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
        filter((event) => event instanceof NavigationEnd),
        map(() => parse(this.router.url).pathname),
        distinctUntilChanged(),
        map(() => this._routes$.value),
        filter((val) => !!val),
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

      const { title, path, referrer } = child;

      const isCurrentRoute = this.isCurrentRoute(path, segments);

      if (isCurrentRoute || index === children.length - 1) {
        routes.push({
          title,
          path: this.getPath(path, segments),
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
      path: this.getPath(referrer.path, segments),
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
    return url.split('/').filter((part) => part !== '');
  }

  private isParameter(part: string) {
    return part.startsWith(':');
  }

  private getRoutesConfig(journey: JourneyType) {
    let routes: JourneyRoute;
    switch (journey) {
      case JourneyType.CQC_MAIN_SERVICE_CHANGE: {
        routes = adminCqcStatusChangeJournery;
        break;
      }
      case JourneyType.ADMIN: {
        routes = adminJourney;
        break;
      }
      case JourneyType.ADMIN_PENDING_REGISTRATIONS: {
        routes = adminPendingRegistrationJourney;
        break;
      }
      case JourneyType.ADMIN_REJECTED_REGISTRATIONS: {
        routes = adminRejectedRegistrationJourney;
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
      case JourneyType.BULK_UPLOAD_HELP: {
        routes = bulkUploadHelpJourney;
        break;
      }
      case JourneyType.ACCOUNT: {
        routes = accountJourney;
        break;
      }
      case JourneyType.EDIT_USER: {
        routes = editUserJourney;
        break;
      }
      case JourneyType.NOTIFICATIONS: {
        routes = notificationsJourney;
        break;
      }
      case JourneyType.MANDATORY_TRAINING: {
        routes = mandatoryTrainingJourney;
        break;
      }
      case JourneyType.BENCHMARKS_PAY: {
        routes = benchmarksPayJourney;
        break;
      }
      case JourneyType.BENCHMARKS_SICKNESS: {
        routes = benchmarksSicknessJourney;
        break;
      }
      case JourneyType.BENCHMARKS_TURNOVER: {
        routes = benchmarksTurnoverJourney;
        break;
      }
      case JourneyType.BENCHMARKS_QUALIFICATIONS: {
        routes = benchmarksQualificationsJourney;
        break;
      }
      case JourneyType.WDF: {
        routes = wdfJourney;
        break;
      }
      case JourneyType.WDF_PARENT: {
        routes = wdfParentJourney;
        break;
      }
      case JourneyType.BENCHMARKS_SUBSIDIARIES_PAY: {
        routes = benchmarksSubsidiariesPayJourney;
        break;
      }
      case JourneyType.BENCHMARKS_SUBSIDIARIES_TURNOVER: {
        routes = benchmarksSubsidiariesTurnoverJourney;
        break;
      }
      case JourneyType.BENCHMARKS_SUBSIDIARIES_SICKNESS: {
        routes = benchmarksSubsidiariesSicknessJourney;
        break;
      }
      case JourneyType.BENCHMARKS_SUBSIDIARIES_QUALIFICATIONS: {
        routes = benchmarksSubsidiariesQualificationsJourney;
        break;
      }
      case JourneyType.PAGES_ARTICLES: {
        routes = pagesArticlesJourney;
        break;
      }
      case JourneyType.BENEFITS_BUNDLE: {
        routes = benefitsBundleJourney;
        break;
      }
      default: {
        routes = null;
      }
    }
    return routes;
  }
}
