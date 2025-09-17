import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CookiePolicyService } from '@core/services/cookie-policy.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, takeWhile } from 'rxjs/operators';
import { AnalyticCookiesService } from '@core/services/analytic-cookies.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss',
})
export class CookieBannerComponent implements OnInit, OnDestroy {
  private _isShowing: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private subscriptions: Subscription = new Subscription();

  @ViewChild('cookieBanner') cookieBanner: ElementRef;

  constructor(
    private cookiePolicyService: CookiePolicyService,
    private analyticCookiesService: AnalyticCookiesService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkIfShouldShowBanner();
    this.setupRecheckOnPageChange();
    this.triggerGoogleAnalyticsTrackingIfAcceptedBefore();
  }

  get isShowing() {
    return this._isShowing.value;
  }

  private checkIfShouldShowBanner() {
    const shouldShow = this.shouldShowBanner();
    this._isShowing.next(shouldShow);
  }

  private shouldShowBanner(): boolean {
    if (this.cookiePolicyService.hasAnsweredCookiePreferences) {
      return false;
    }

    const userHasLoggedIn = !!this.userService.loggedInUser;
    if (userHasLoggedIn) {
      return this.shouldShowBannerToLoggedInUser();
    }

    return this.shouldShowShowBannerToVisitor();
  }

  private shouldShowBannerToLoggedInUser(): boolean {
    const viewingAdminPage = this.router.url.includes('sfcadmin');
    const viewingCookiePolicyPage = this.router.url.includes('cookie-policy');

    return !viewingAdminPage && !viewingCookiePolicyPage;
  }

  private shouldShowShowBannerToVisitor(): boolean {
    const firstQuestionPageInCreateNewAccountJourney = '/registration/regulated-by-cqc';
    return this.router.url.includes(firstQuestionPageInCreateNewAccountJourney);
  }

  public acceptAnalyticCookies() {
    this.cookiePolicyService.acceptAnalyticCookies();
    this.analyticCookiesService.startGoogleAnalyticsTracking();
    this._isShowing.next(false);
  }

  public rejectAnalyticCookies() {
    this.cookiePolicyService.rejectAnalyticCookies();
    this._isShowing.next(false);
  }

  private setupRecheckOnPageChange() {
    const pageChangeEventsUntilAnswered = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeWhile(() => !this.cookiePolicyService.hasAnsweredCookiePreferences),
    );

    const recheckOnPageChange = pageChangeEventsUntilAnswered.subscribe(() => {
      this.checkIfShouldShowBanner();
    });

    this.subscriptions.add(recheckOnPageChange);
  }

  private triggerGoogleAnalyticsTrackingIfAcceptedBefore() {
    if (this.cookiePolicyService.analyticCookiesAccepted) {
      this.analyticCookiesService.startGoogleAnalyticsTracking();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
