import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CookiePolicyService } from '@core/services/cookie-policy.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, takeWhile } from 'rxjs/operators';
import { AnalyticCookiesService } from '../../../core/services/analytic-cookies.service';

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
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkIfShouldShowUp();
    this.listenToPageChange();
    this.triggerGoogleAnalyticsTrackingIfAccepted();
  }

  get isShowing() {
    return this._isShowing.value;
  }

  private checkIfShouldShowUp() {
    if (!this.cookiePolicyService.hasAnsweredCookiePreferences) {
      this._isShowing.next(true);
    }
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

  private listenToPageChange() {
    const pageChangeEventsUntilAnswered = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeWhile(() => !this.cookiePolicyService.hasAnsweredCookiePreferences),
    );

    const recheckOnPageChange = pageChangeEventsUntilAnswered.subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      if (url.includes('cookie-policy') || url.includes('sfcadmin')) {
        this._isShowing.next(false);
      } else {
        this.checkIfShouldShowUp();
      }
    });

    this.subscriptions.add(recheckOnPageChange);
  }

  private triggerGoogleAnalyticsTrackingIfAccepted() {
    if (this.cookiePolicyService.analyticCookiesAccepted) {
      this.analyticCookiesService.startGoogleAnalyticsTracking();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
