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
  adminUserJourney,
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
import { helpJourney } from '@core/breadcrumb/journey.help';
import { mandatoryTrainingJourney } from '@core/breadcrumb/journey.mandatory_training';
import { notificationsJourney } from '@core/breadcrumb/journey.notifications';
import { pagesArticlesJourney } from '@core/breadcrumb/journey.pages-articles';
import {
  becomeAParentJourney,
  changeDataOwnerJourney,
  linkToParentJourney,
  removeLinkToParentJourney,
} from '@core/breadcrumb/journey.parent-requests';
import { publicJourney } from '@core/breadcrumb/journey.public';
import { subsidiaryJourney } from '@core/breadcrumb/journey.subsidiary';
import { trainingCourseJourney } from '@core/breadcrumb/journey.training-course';
import { updateRecordsWithTrainingCourseDetailsJourney } from '@core/breadcrumb/journey.update-records-with-training-course-details';
import { wdfJourney } from '@core/breadcrumb/journey.wdf';
import {
  allWorkplacesJourney,
  benchmarksTabJourney,
  deleteWorkplaceJourney,
  myWorkplaceJourney,
  staffRecordsTabJourney,
  trainingAndQualificationsTabJourney,
  workplaceTabJourney,
} from '@core/breadcrumb/journey.workplaces';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { parse } from 'url';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly _routes$: BehaviorSubject<Array<JourneyRoute>> = new BehaviorSubject<Array<JourneyRoute>>(null);
  public readonly routes$: Observable<Array<JourneyRoute>> = this._routes$.asObservable();
  private readonly _overrideMessage$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public readonly overrideMessage$: Observable<string> = this._overrideMessage$.asObservable();

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

  // Parent  , Home, Your other workplaces, Workplace, Staff record
  // Sketch  , Home, Staff Records
  // Sub view, Home, Users, User details, Permissions
  public show(journey: JourneyType, overrideMessage: string = null) {
    let path = this.location.path();
    if (journey !== JourneyType.SUBSIDIARY) {
      path = path.replace('/subsidiary', '');
    }

    const urlTree = this.router.parseUrl(path);
    const segmentGroup = urlTree.root.children[PRIMARY_OUTLET];
    const segments = segmentGroup ? segmentGroup.segments : null;
    const routes = this.getRoutes(this.getRoutesConfig(journey), segments);
    this._routes$.next(routes);
    this._overrideMessage$.next(overrideMessage);
  }

  public removeRoutes(): void {
    this._routes$.next(null);
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

      if (isCurrentRoute || index === children?.length - 1) {
        routes.push({
          title,
          path: this.getPath(path, segments),
          fragment: child.fragment,
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

  public getPath(url: string, segments: UrlSegment[]) {
    const path = this.getParts(url).map((part, index) => {
      if (this.isParameter(part)) {
        if (part === ':establishmentuid' && segments[index]?.path === 'workplace') {
          return segments[index + 1]?.path;
        }
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
      case JourneyType.ADMIN_USERS: {
        routes = adminUserJourney;
        break;
      }
      case JourneyType.WORKPLACE_TAB: {
        routes = workplaceTabJourney;
        break;
      }
      case JourneyType.STAFF_RECORDS_TAB: {
        routes = staffRecordsTabJourney;
        break;
      }
      case JourneyType.TRAINING_AND_QUALIFICATIONS_TAB: {
        routes = trainingAndQualificationsTabJourney;
        break;
      }
      case JourneyType.TRAINING_COURSE: {
        routes = trainingCourseJourney;
        break;
      }
      case JourneyType.UPDATE_RECORDS_WITH_TRAINING_COURSE_DETAILS: {
        routes = updateRecordsWithTrainingCourseDetailsJourney;
        break;
      }
      case JourneyType.BENCHMARKS_TAB: {
        routes = benchmarksTabJourney();
        break;
      }
      case JourneyType.OLD_BENCHMARKS_DATA_TAB: {
        routes = benchmarksTabJourney(true);
        break;
      }

      case JourneyType.BECOME_A_PARENT: {
        routes = becomeAParentJourney;
        break;
      }

      case JourneyType.REMOVE_LINK_TO_PARENT: {
        routes = removeLinkToParentJourney;
        break;
      }

      case JourneyType.LINK_TO_PARENT: {
        routes = linkToParentJourney;
        break;
      }

      case JourneyType.CHANGE_DATA_OWNER: {
        routes = changeDataOwnerJourney;
        break;
      }

      case JourneyType.ABOUT_PARENTS: {
        routes = workplaceTabJourney;
        break;
      }

      case JourneyType.SUBSIDIARY: {
        routes = subsidiaryJourney;
        break;
      }

      case JourneyType.DELETE_WORKPLACE: {
        routes = deleteWorkplaceJourney;
        break;
      }

      case JourneyType.HELP: {
        routes = helpJourney;
        break;
      }

      default: {
        routes = null;
      }
    }
    return routes;
  }
}
