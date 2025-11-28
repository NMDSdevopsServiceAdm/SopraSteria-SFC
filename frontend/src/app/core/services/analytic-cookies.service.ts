import { combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { isAdminRole } from '@core/utils/check-role-util';

import { EstablishmentService } from './establishment.service';
import { UserService } from './user.service';
import { WindowToken } from './window';

const googleTagManagerId = 'GTM-WZKV3HJ';

@Injectable({
  providedIn: 'root',
})
export class AnalyticCookiesService {
  constructor(
    @Inject(WindowToken) private window: Window,
    @Inject(DOCUMENT) private document: Document,
    private userService: UserService,
    private establishmentService: EstablishmentService,
  ) {}

  public startGoogleAnalyticsTracking(): void {
    try {
      if (this.googleAnalyticsTagAlreadyInserted()) {
        return;
      }

      this.window.dataLayer = this.window.dataLayer || [];

      this.pushStartEvent();
      this.setupPushUserType();

      this.injectScriptTag();
    } catch (e) {
      console.log('failed to initiate google tag manager');
      console.error(e);
    }
  }

  private pushStartEvent(): void {
    this.window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  }

  private setupPushUserType(): void {
    const user$ = this.userService.loggedInUser$;
    const workplace$ = this.establishmentService.establishmentObservable$;

    const userAndWorkplaceAreKnown = ([user, workplace]) => !!user && !!workplace;
    const onlyActWhenUserChanges = distinctUntilChanged<[user: UserDetails, workplace: Establishment]>(
      ([prevUser, _wp0], [currUser, _wp1]) => prevUser === currUser,
    );

    combineLatest([user$, workplace$])
      .pipe(
        filter(userAndWorkplaceAreKnown),
        onlyActWhenUserChanges,
        map(([user, workplace]) => this.determineUserType(user, workplace)),
        filter((userType) => !!userType),
      )
      .subscribe((userType) => this.pushUserType(userType));
  }

  private pushUserType(userType: string): void {
    this.window.dataLayer = this.window.dataLayer || [];
    this.window.dataLayer.push({ userType });
  }

  private determineUserType(user: UserDetails, workplace: Establishment): string {
    if (!workplace || !user) {
      return;
    }

    if (isAdminRole(user?.role)) return 'Admin';
    if (workplace.isParent) return 'Parent';
    if (workplace.parentUid) return 'Sub';

    return 'Standalone';
  }

  private injectScriptTag(): void {
    const scriptTag = this.document.createElement('script', {});
    scriptTag.async = true;
    scriptTag.type = 'text/javascript';
    scriptTag.src = `https://www.googletagmanager.com/gtm.js?id=${googleTagManagerId}`;

    document.head.appendChild(scriptTag);
  }

  private googleAnalyticsTagAlreadyInserted(): boolean {
    try {
      const gaScriptTagsFound = this.document.querySelectorAll('[src*="googletagmanager"]');
      return gaScriptTagsFound?.length > 0;
    } catch (e) {
      return false;
    }
  }
}
